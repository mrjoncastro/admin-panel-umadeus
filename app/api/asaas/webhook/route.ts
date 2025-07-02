import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import type { AsaasWebhookPayload } from '@/lib/webhookProcessor'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const timestamp = new Date().toISOString()

  // 1️⃣ Parse do JSON com tratamento de erro
  let data: AsaasWebhookPayload
  try {
    data = (await req.json()) as AsaasWebhookPayload
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    await logConciliacaoErro(
      `[${timestamp}] JSON inválido:\n` + `URL: ${req.url}\n` + `Error: ${msg}`,
    )
    return NextResponse.json(
      { error: 'JSON inválido', details: msg },
      { status: 400 },
    )
  }

  const payload = data as Partial<AsaasWebhookPayload>

  const pb = createPocketBase()
  const wasValid = pb.authStore.isValid

  try {
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    await pb.collection('webhook_tasks').create({
      event: payload.event ?? 'unknown',
      payload: JSON.stringify(payload),
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
    })

    // 4️⃣ ACK rápido
    return NextResponse.json({ status: 'ack' }, { status: 200 })
  } catch (error: unknown) {
    // 5️⃣ Coleta contexto para debug
    const errName = error instanceof Error ? error.name : 'UnknownError'
    const errMsg = error instanceof Error ? error.message : String(error)
    const errStack = error instanceof Error && error.stack ? error.stack : '—'
    const headers: Record<string, string> = {}
    req.headers.forEach((v, k) => {
      headers[k] = v
    })

    await logConciliacaoErro(
      `❌ Erro ao enfileirar webhook (${timestamp}):\n` +
        `URL: ${req.url}\n` +
        `Method: ${req.method}\n` +
        `Headers: ${JSON.stringify(headers)}\n` +
        `PB.authStore.isValid (antes): ${wasValid}\n` +
        `ENV PB_ADMIN_EMAIL definida: ${Boolean(process.env.PB_ADMIN_EMAIL)}\n` +
        `ENV PB_ADMIN_PASSWORD definida: ${Boolean(process.env.PB_ADMIN_PASSWORD)}\n` +
        `Payload: ${JSON.stringify(payload)}\n` +
        `ErrorName: ${errName}\n` +
        `ErrorMessage: ${errMsg}\n` +
        `ErrorStack: ${errStack}`,
    )

    return NextResponse.json(
      { error: 'Erro interno', details: errMsg },
      { status: 500 },
    )
  }
}
