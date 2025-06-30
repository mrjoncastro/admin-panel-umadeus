## Guia de Implementação: Fila `webhook_tasks` no PocketBase e Scheduled Function na Vercel

Este guia descreve passo a passo como estruturar a **coleção `webhook_tasks`** no PocketBase, implementar o **handler** de webhook que enfileira tarefas, e configurar uma **Scheduled Function** na Vercel para processar essas tarefas em background.

---

### 1. Pré-requisitos

- Projeto Next.js rodando na Vercel
- Instância PocketBase acessível (auto-hospedada ou via serviço)
- Conta admin configurada no PocketBase
- Acesso ao painel de _Environment Variables_ da Vercel

---

### 2. Criação da coleção `webhook_tasks` no PocketBase

1. Acesse o **Admin UI** do PocketBase.
2. No menu lateral, clique em **Collections** e depois em **+ Add collection**.
3. Defina o **Collection Name** como `webhook_tasks`.
4. Adicione os seguintes campos:

   | Nome           | Tipo           | Atributos                                                        |
   | -------------- | -------------- | ---------------------------------------------------------------- |
   | `id`           | Text           | **System** (auto-generated), Hidden                              |
   | `event`        | Text           | **Required**                                                     |
   | `payload`      | JSON           | **Required**                                                     |
   | `status`       | Select (Enum)  | **Required**, opções: `pending`, `processing`, `done`, `failed`   |
   | `attempts`     | Number         | **Required**, Default: `0`                                       |
   | `max_attempts` | Number         | **Required**, Default: `3`                                       |
   | `error`        | Text           | Opcional                                                         |
   | `next_retry`   | DateTime       | Opcional (data/hora do próximo retry)                            |
   | `created`      | DateTime       | Auto (`Create`)                                                  |
   | `updated`      | DateTime       | Auto (`Update`)

> **Como definir valores padrão (Default values)**
> 1. No **Admin UI** do PocketBase, acesse **Collections > webhook_tasks > Fields**.
> 2. Clique no ícone de engrenagem ⚙️ ao lado do campo **attempts**.
> 3. No painel lateral de configurações, role até **Default value** e insira **0**.
> 4. Salve as alterações desse campo.
> 5. Repita para o campo **max_attempts**, definindo **Default value = 3**.
>
5. Em **Indexes**, crie índices em `status` e `next_retry` para otimizar consultas.
6. Salve a coleção. Em **Indexes**, crie índices em `status` e `next_retry` para otimizar consultas.
6. Salve a coleção.

---

### 3. Variáveis de Ambiente na Vercel

No Dashboard da Vercel, em **Settings → Environment Variables**, defina:

| Nome                  | Valor                                 | Descrição                               |
| --------------------- | ------------------------------------- | --------------------------------------- |
| `PB_URL`              | URL do PocketBase (ex: `https://...`) | Endpoint da sua instância PocketBase    |
| `PB_ADMIN_EMAIL`      | `seu-email@dominio.com`               | Conta admin do PocketBase               |
| `PB_ADMIN_PASSWORD`   | `senhaAdmin`                          | Senha do admin                          |
| `BACKOFF_BASE_DELAY`  | `5000`                                | Delay base para backoff (em ms)         |

---

### 4. Implementação do Handler de Webhook

Crie ou edite o arquivo:

`/pages/api/asaas/webhook.ts`

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'
import PocketBase from 'pocketbase'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // 1. Leia raw body e parse JSON
  const raw = await getRawBody(req)
  let payload: any
  try {
    payload = JSON.parse(raw.toString())
  } catch {
    return res.status(400).json({ error: 'JSON inválido' })
  }

  // 2. Responde imediatamente para evitar timeout da Asaas
  res.status(200).json({ ok: true })

  try {
    // 3. Autentica no PocketBase
    const pb = new PocketBase(process.env.PB_URL!)
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    )

    // 4. Cria a task na coleção
    await pb.collection('webhook_tasks').create({
      event:        payload.event || '',
      payload:      JSON.stringify(payload),
      status:       'pending',
      attempts:     0,
      max_attempts: 3,
      next_retry:   null,
    })
  } catch (err) {
    console.error('Erro ao enfileirar webhook task:', err)
  }
}
```

**Descrição**:
- Leitura de _raw body_ para, futuramente, adicionar validação de assinatura via `X-Asaas-Signature`.
- Resposta rápida (`res.status(200)`) para prevenir timeouts da Asaas.
- Task inicial criada com `status = "pending"`.

---

### 5. Scheduled Function na Vercel

Crie o arquivo:

`/pages/api/cron/process-webhook-tasks.ts`

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import PocketBase from 'pocketbase'

export const config = {
  runtime:  'nodejs',       // usa Node.js para compatibilidade
  schedule: '*/5 * * * *',  // a cada 5 minutos
}

interface Task {
  id: string
  event: string
  payload: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  attempts: number
  max_attempts: number
  next_retry: string | null
}

async function processPendingTasks() {
  const pb = new PocketBase(process.env.PB_URL!)
  await pb.admins.authWithPassword(
    process.env.PB_ADMIN_EMAIL!,
    process.env.PB_ADMIN_PASSWORD!
  )

  const now = new Date().toISOString()
  const tasks = await pb.collection('webhook_tasks').getFullList<Task>({
    filter: `status = "pending" && (next_retry is null || next_retry <= "${now}")`,
    sort:   'created',
    limit:  10,
  })

  await Promise.all(
    tasks.map(async (task) => {
      // marca como processing
      await pb.collection('webhook_tasks').update(task.id, { status: 'processing' })

      try {
        const body = JSON.parse(task.payload)
        // TODO: coloque aqui sua lógica de negócio (e.g., atualizar pedidos/inscrições)

        // marca como done
        await pb.collection('webhook_tasks').update(task.id, {
          status: 'done',
          error:  '',
        })
      } catch (err: any) {
        const attempts = (task.attempts || 0) + 1
        const isLast   = attempts >= (task.max_attempts || 3)
        const baseMs   = Number(process.env.BACKOFF_BASE_DELAY || '5000')
        const nextDelay = baseMs * attempts
        const nextRetry = isLast ? null : new Date(Date.now() + nextDelay).toISOString()

        await pb.collection('webhook_tasks').update(task.id, {
          status:     isLast ? 'failed' : 'pending',
          attempts,
          error:      String(err),
          next_retry: nextRetry,
        })
        console.error(`Task ${task.id} falhou:`, err)
      }
    })
  )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await processPendingTasks()
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Erro no cron process-webhook-tasks:', err)
    return res.status(500).json({ error: 'Falha no processamento das tasks' })
  }
}
```

**Detalhes**:
- Enum no TypeScript para `status`, refletindo o campo Select no PB.
- Busca e processa tasks pendentes, atualizando `status`, `attempts`, `error` e `next_retry`.

---

### 6. Monitoramento e Dashboard

No seu painel admin Next.js, crie uma página para listar `webhook_tasks`:

```tsx
// pages/admin/webhook-tasks.tsx
import { useEffect, useState } from 'react'
import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!)

export default function WebhookTasks() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    pb.collection('webhook_tasks').getFullList({ sort: '-created', page: 1, perPage: 50 })
      .then(setTasks)
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Tarefas de Webhook</h1>
      <table className="w-full table-auto">
        <thead>
          <tr><th>Evento</th><th>Status</th><th>Tent.</th><th>Erro</th><th>Próx. Retry</th></tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>{t.event}</td>
              <td>{t.status}</td>
              <td>{t.attempts}/{t.max_attempts}</td>
              <td>{t.error || '—'}</td>
              <td>{t.next_retry ? new Date(t.next_retry).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Funcionalidades**:
- Visualização em tempo real das tasks (com `status` como enum, tentativas, erros e próximos retries).

---

### 7. Testes

1. **Criação de Task**: dispare um POST via `curl` ou Insomnia no endpoint `/api/asaas/webhook` e verifique no PB que uma nova task com `status = pending` foi criada.
2. **Execução do Cron**: aguarde o próximo disparo automático (ou acione manualmente a rota `/api/cron/process-webhook-tasks`) e confirme que o `status` da task muda para `done` ou `failed`.
3. **Backoff**: force um erro na lógica de processamento e confirme se `attempts` incrementa e `next_retry` é calculado corretamente.

---

🎉 **Pronto!** Você agora tem uma fila de tarefas durável, com `status` em enum, retries e backoff, totalmente gerenciada no PocketBase e processada via Scheduled Function na Vercel. Mantenha seu sistema resiliente sem adicionar custos extras de infraestrutura.

