# Guia de Implementação do Webhook Asaas com Fila de Tasks e Worker em Next.js + PocketBase

Este guia descreve passo a passo como implementar um **webhook leve** que enfileira tarefas em uma coleção `webhook_tasks` no PocketBase e processa-as em **background** por meio de um worker agendado.

---

## 1. Configuração da Coleção `webhook_tasks`
No PocketBase Admin UI, crie uma collection **Base** chamada `webhook_tasks` com os seguintes campos:

| Campo        | Tipo      | Atributos                  | Observações                                   |
|--------------|-----------|----------------------------|-----------------------------------------------|
| `id`         | Auto      | Nonempty                   | Identificador único                           |
| `event`      | Text      | Nonempty                   | Nome do evento recebido                       |
| `payload`    | Text      | Nonempty                   | JSON string do body do webhook                |
| `status`     | Enum      | Nonempty<br/>Valores: `pending` · `processing` · `done` · `failed` | Estado da task                                |
| `attempts`   | Number    | —                          | Quantidade de tentativas já realizadas        |
| `max_attempts` | Number  | —                          | Número máximo de retries                      |
| `error`      | Text      | —                          | Mensagem de erro (caso falhe)                 |
| `next_retry` | DateTime  | —                          | Próxima data/hora para retry                  |
| `created`    | DateTime  | Create                     | Timestamp de criação                          |
| `updated`    | DateTime  | Create/Update              | Timestamp de última atualização               |

> **Dica:** ajuste `max_attempts` conforme sua política de retries.

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
Implemente um worker que seja executado **periodicamente** (via cron ou agendador) para processar as tasks.

**Arquivo**: `/app/api/tasks/worker/route.ts`
```ts
import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { processWebhook } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

// Garante nodejs runtime para maior timeout
export const config = { runtime: 'nodejs' }

export async function GET() {
  const pb = createPocketBase()
  // 1. Seleciona até N tasks pendentes ou com retry vencido
  const tasks = await pb.collection('webhook_tasks').getList(1, 20, {
    filter: `status="pending" || (status="failed" && next_retry <= \"${new Date().toISOString()}\")`,
    sort: 'created',
  })

  for (const t of tasks.items) {
    // 2. Marca como processing
    await pb.collection('webhook_tasks').update(t.id, {
      status: 'processing',
      attempts: t.attempts + 1,
    })

    try {
      const data = JSON.parse(t.payload)
      // 3. Processa (toda sua lógica de conciliação)
      await processWebhook(data)
      // 4a. Conclui
      await pb.collection('webhook_tasks').update(t.id, { status: 'done' })
    } catch (err: any) {
      // 4b. Marca failed ou schedule retry
      const willRetry = t.attempts + 1 < t.max_attempts
      await pb.collection('webhook_tasks').update(t.id, {
        status: willRetry ? 'failed' : 'done',
        error: String(err).slice(0, 200),
        next_retry: willRetry
          ? new Date(Date.now() + 5 * 60 * 1000).toISOString()
          : null,
      })
      await logConciliacaoErro(`Task ${t.id} falhou: ${err}`)
    }
  }

  return NextResponse.json({ processed: tasks.items.length })
}
```

**Observações:**
- Crie um agendamento (cron job) para chamar `GET /api/tasks/worker` a cada 1–5 minutos.
- Ajuste `getList(…, pageSize)` ao volume de webhooks.

---

## 4. Função `processWebhook`
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
       "crons": [ { "path": "/api/tasks/worker", "schedule": "*/1 * * * *" } ]
     }
     ```

---

## 6. Monitoramento e Logs
- Consulte os registros no PocketBase (`error` e `next_retry`).
- Centralize logs de erro via `logConciliacaoErro`.
- Use métricas de sucesso/falha para ajustar `max_attempts` e `retry interval`.

---

✅ Com essa arquitetura, seu webhook responderá em <100 ms, não sofrerá timeouts, e você terá controle completo sobre retries e falhas. Bom implement!

