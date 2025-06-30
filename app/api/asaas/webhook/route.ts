import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export type WebhookTaskStatus = 'pending' | 'processing' | 'done' | 'failed'

interface WebhookTask {
  event: string
  payload: unknown
  status: WebhookTaskStatus
  attempts: number
  max_attempts: number
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  try {
    await pb.collection('webhook_tasks').create<WebhookTask>({
      event: typeof payload.event === 'string' ? payload.event : 'unknown',
      payload,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
    })
  } catch (err) {
    console.error('Erro ao enfileirar webhook task:', err)
  }

  return NextResponse.json({ ok: true })
}
