# Guia de Implementação do Webhook Asaas com Fila de Tasks e Worker em Next.js + PocketBase

Este guia descreve passo a passo como implementar um **webhook leve** que enfileira tarefas em uma coleção `webhook_tasks` no PocketBase e processa-as em **background** por meio de um worker agendado.

---

## 1. Configuração da Coleção `webhook_tasks`

No PocketBase Admin UI, crie uma collection **Base** chamada `webhook_tasks` com os seguintes campos:

| Campo          | Tipo     | Atributos                                                      | Observações                            |
| -------------- | -------- | -------------------------------------------------------------- | -------------------------------------- |
| `id`           | Auto     | Nonempty                                                       | Identificador único                    |
| `event`        | Text     | Nonempty                                                       | Nome do evento recebido                |
| `payload`      | Text     | Nonempty                                                       | JSON string do body do webhook         |
| `status`       | Enum     | Nonempty Valores: `pending` · `processing` · `done` · `failed` | Estado da task                         |
| `attempts`     | Number   | —                                                              | Quantidade de tentativas já realizadas |
| `max_attempts` | Number   | —                                                              | Número máximo de retries               |
| `cliente`      | Relation | Required → **m24_clientes.id**                                 | Vínculo ao registro de cliente         |
| `error`        | Text     | —                                                              | Mensagem de erro (caso falhe)          |
| `next_retry`   | DateTime | —                                                              | Próxima data/hora para retry           |
| `created`      | DateTime | Create                                                         | Timestamp de criação                   |
| `updated`      | DateTime | Create/Update                                                  | Timestamp de última atualização        |

> **Dica:** o campo `cliente` deve referenciar o registro correto em `m24_clientes`; extraia o ID do `externalReference` ou do payload para popular essa relação.

---

## 2. Handler do Webhook (Receiver)

Crie ou adapte a rota de webhook para **enfileirar** a task em vez de processar tudo de uma vez.

**Arquivo**: `/app/api/asaas/webhook/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  // 1. Parse JSON
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // 2. Auth no PB
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  // 3. Enfileira a task
  await pb.collection('webhook_tasks').create({
    event: (payload as any).event ?? 'unknown',
    payload: JSON.stringify(payload),
    status: 'pending',
    attempts: 0,
    max_attempts: 5,
  })

  // 4. ACK imediato
  return NextResponse.json({ status: 'ack' }, { status: 200 })
}
```

**Pontos-chave:**

- **Sem lógica de negócios** nesta rota: apenas validação mínima + gravação da task.
- **Resposta em milissegundos**: elimina 408/timeout.

---

## 3. Processador de Tasks (Worker)

A implementação do **worker** deve ser colocada em uma rota ou script que execute periodicamente (cron) para processar as tasks enfileiradas. Abaixo o passo a passo e um exemplo detalhado.

**Arquivo**: `/app/api/tasks/worker/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { processWebhook } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

// Garante Node.js runtime para maior timeout
export const config = { runtime: 'nodejs' }

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Inicializa PocketBase e autentica se necessário
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  // 2. Seleciona até 20 tasks pendentes ou com retry vencido
  const now = new Date().toISOString()
  const { items: tasks } = await pb.collection('webhook_tasks').getList(1, 20, {
    filter: `status="pending" || (status="failed" && next_retry <= \"${now}\")`,
    sort: 'created',
  })

  for (const task of tasks) {
    // 3. Marca como processing e incrementa tentativas
    await pb.collection('webhook_tasks').update(task.id, {
      status: 'processing',
      attempts: task.attempts + 1,
      updated: new Date().toISOString(),
    })

    try {
      // 4. Parse e processamento
      const data = JSON.parse(task.payload)
      await processWebhook(data)

      // 5a. Conclui com sucesso
      await pb.collection('webhook_tasks').update(task.id, {
        status: 'done',
        updated: new Date().toISOString(),
      })
    } catch (error: any) {
      // 5b. Trata falha e agenda retry se aplicável
      const willRetry = task.attempts + 1 < task.max_attempts
      await pb.collection('webhook_tasks').update(task.id, {
        status: willRetry ? 'failed' : 'done',
        error: String(error).substring(0, 200),
        next_retry: willRetry
          ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
          : null,
        updated: new Date().toISOString(),
      })
      await logConciliacaoErro(
        `Task ${task.id} falhou na tentativa ${task.attempts + 1}: ${error}`,
      )
    }
  }

  return NextResponse.json({ processed: tasks.length })
}
```

### Passos detalhados

1. **Autenticação**: garante `authStore.isValid` antes de operar no PB.
2. **Leitura de tasks**: filtra `pending` e `failed` elegíveis para retry (campo `next_retry`).
3. **Marcação de estado**: atualiza `status`, incrementa `attempts` e seta `updated`.
4. **Processamento**: parse do payload e chamada ao `processWebhook`, isolando a lógica de negócio.
5. **Finalização**: marca como `done` ou `failed`, define `next_retry` para re-tentativas e registra erro.
6. **Log de erro**: centralizado via `logConciliacaoErro`, facilita monitoramento.

### Agendamento (Cron)

Para rodar o **worker** periodicamente no Vercel, você pode usar os Cron Jobs nativos ou a configuração em arquivo `vercel.json`.

#### 1. Configuração via `vercel.json`

No `vercel.json` na raiz do seu projeto, adicione:

```json
{
  "functions": {
    "api/tasks/worker/route.ts": {
      "runtime": "nodejs",
      "maxDuration": 900
    }
  },
  "crons": [
    {
      "path": "/api/tasks/worker",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

- \`\`: configura o runtime Node.js e aumenta o tempo máximo (em segundos) para até 15 minutos.
- \`\`: define o endpoint e o agendamento (neste exemplo, a cada 2 minutos).

> Após o commit, redeploy, o Vercel automaticamente registra o cron.

#### 2. Configuração via Dashboard Vercel

Para configurar o cron diretamente pela interface do Vercel:

1. **Acesse o Dashboard**
   - Entre no Vercel, selecione seu time e clique no projeto **umadeus-admin**.
2. **Abra as configurações de Cron Jobs**
   - Navegue em **Settings** → **Cron Jobs** no menu lateral.
   - Verifique se o toggle **Enabled** está ativo (conforme a imagem abaixo).&#x20;
3. **Adicione um novo Cron Job**
   - Clique em **Add Cron Job**.
   - No modal, preencha os campos:
     - **Endpoint**: `/api/tasks/worker`
     - **Schedule**: expressão cron (ex.: `*/2 * * * *` para rodar a cada 2 minutos).
     - **Environment**: escolha `Production` (ou `Preview`, conforme sua necessidade).
     - **Secret**: selecione um **Environment Variable** (ex.: `CRON_SECRET`) que você deve ter previamente configurado em **Settings** → **Environment Variables**.
   - Exemplo de variável secreta:
     ```
     Key: CRON_SECRET
     Value: your-super-secret-token
     ```
4. **Proteja o endpoint**
   - No handler do worker, valide o header de autorização:
     ```ts
     export async function GET(req: NextRequest) {
       const auth = req.headers.get('Authorization')
       if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }
       // ...restante do worker
     }
     ```
5. **Salve e monitore**
   - Clique em **Save Cron Job**. O Vercel exibirá logs de cada execução em **Functions** → **Invocations**.
   - Verifique periodicamente a aba **Logs** para garantir que seu worker está rodando conforme o agendamento.

---

Com isso, seu **worker** será executado automaticamente pelo Vercel, sem necessidade de infraestrutura adicional.

## 4. Função `processWebhook`## 4. Função `processWebhook`

Extraia toda a lógica de fetch Asaas, atualização de `pedidos` e notificações para um módulo separado:

**Arquivo**: `/lib/webhookProcessor.ts`

```ts
import createPocketBase from './pocketbase'
import { logConciliacaoErro } from './server/logger'

export async function processWebhook(body: AsaasWebhookPayload) {
  // Replicar aqui TODO o fluxo de conciliação:
  // - Autenticar no PB
  // - Validar body.event e body.payment.id
  // - Buscar credenciais do cliente
  // - Fetch /payments e /customers da Asaas
  // - Buscar e atualizar pedido e inscrição
  // - Enviar e-mail e WhatsApp
}
```

> **Por que?** simplifies manutenção e permite testes unitários.

---

## 5. Deploy e Configurações

1. **Env vars**:
   - `PB_ADMIN_EMAIL`, `PB_ADMIN_PASSWORD`
   - `ASAAS_API_URL`
2. **Runtime**:
   - Webhook route pode usar Edge ou Node, mas Node garante mais tempo.
   - Worker deve rodar em Node.
3. **Cron**:
   - No Vercel: crie uma entrada em `vercel.json`:
     ```json
     {
       "crons": [{ "path": "/api/tasks/worker", "schedule": "*/1 * * * *" }]
     }
     ```

---

## 6. Monitoramento e Logs

- Consulte os registros no PocketBase (`error` e `next_retry`).
- Centralize logs de erro via `logConciliacaoErro`.
- Use métricas de sucesso/falha para ajustar `max_attempts` e `retry interval`.

---

✅ Com essa arquitetura, seu webhook responderá em <100 ms, não sofrerá timeouts, e você terá controle completo sobre retries e falhas. Bom implement!
