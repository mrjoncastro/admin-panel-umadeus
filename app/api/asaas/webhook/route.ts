import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import type { AsaasWebhookPayload } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const pb = createPocketBase()
  const data = payload as Partial<AsaasWebhookPayload>

  try {
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    await pb.collection('webhook_tasks').create({
      event: data.event ?? 'unknown',
      payload: JSON.stringify(payload),
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
    })
  } catch (err) {
    await logConciliacaoErro('Erro webhook: ' + String(err))
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ack' }, { status: 200 })
}
