import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export const config = {
  runtime: 'nodejs',
  schedule: '*/5 * * * *',
}

export type WebhookTaskStatus = 'pending' | 'processing' | 'done' | 'failed'

interface Task {
  id: string
  event: string
  payload: unknown
  status: WebhookTaskStatus
  attempts: number
  max_attempts: number
  next_retry?: string | null
  error?: string
}

async function processPendingTasks(pb: ReturnType<typeof createPocketBase>) {
  const now = new Date().toISOString()
  const tasks = await pb.collection('webhook_tasks').getFullList<Task>({
    filter: `status = "pending" && (next_retry='' || next_retry <= "${now}")`,
    sort: 'created',
    batch: 10,
  })

  await Promise.all(
    tasks.map(async (task) => {
      await pb.collection('webhook_tasks').update(task.id, { status: 'processing' })
      try {
        // aqui entraria a lógica de processamento real
        await pb.collection('webhook_tasks').update(task.id, {
          status: 'done',
          error: '',
        })
      } catch (err) {
        const attempts = task.attempts + 1
        const isLast = attempts >= task.max_attempts
        const baseMs = Number(process.env.BACKOFF_BASE_DELAY || '5000')
        const nextRetry = isLast
          ? null
          : new Date(Date.now() + baseMs * attempts).toISOString()
        await pb.collection('webhook_tasks').update(task.id, {
          status: isLast ? 'failed' : 'pending',
          attempts,
          error: String(err),
          next_retry: nextRetry,
        })
      }
    }),
  )
}

export async function GET(): Promise<NextResponse> {
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  try {
    await processPendingTasks(pb)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro no cron process-webhook-tasks:', err)
    return NextResponse.json(
      { error: 'Falha no processamento das tasks' },
      { status: 500 },
    )
  }
}
