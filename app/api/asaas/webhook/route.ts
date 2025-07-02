import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import type { AsaasWebhookPayload } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

export const config = { runtime: 'nodejs' }

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1️⃣ Parse do JSON com tratamento de erro
  let data: AsaasWebhookPayload
  try {
    data = (await req.json()) as AsaasWebhookPayload
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    await logConciliacaoErro(`JSON inválido: ${msg}`)
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const pb = createPocketBase()
  const data = payload as Partial<AsaasWebhookPayload>

  try {
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      )
    }

    await pb.collection('webhook_tasks').create({
      event: data.event ?? 'unknown',
      payload: JSON.stringify(data),
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
    })

    return NextResponse.json({ status: 'ack' }, { status: 200 })
  } catch (error: unknown) {
    // 3️⃣ Extrai message/stack sem usar any
    const msg = error instanceof Error ? error.message : String(error)
    const stk = error instanceof Error && error.stack ? `\n${error.stack}` : ''
    await logConciliacaoErro(`Erro ao enfileirar webhook: ${msg}${stk}`)
    return NextResponse.json(
      { error: 'Erro interno', details: msg },
      { status: 500 }
    )
  }
}
