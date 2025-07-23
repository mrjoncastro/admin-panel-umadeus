// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
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

  let cliente: string | undefined
  const ref = data.payment?.externalReference
  const match = ref ? /cliente_([^_]+)/.exec(ref) : null
  if (match) cliente = match[1]

  const payload: Partial<AsaasWebhookPayload> = {
    ...data,
    ...(cliente ? { cliente } : {}),
  }

  // const pb = createPocketBase() // [REMOVED]
  const wasValid = // pb. // [REMOVED] authStore.isValid

  try {
    if (!// pb. // [REMOVED] authStore.isValid) {
      await // pb. // [REMOVED] admins.authWithPassword(
        process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
        process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
      )
    }

    await // pb. // [REMOVED] collection('webhook_tasks').create({
      event: payload.event ?? 'unknown',
      payload: JSON.stringify(payload),
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
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
        `ENV // PB_ADMIN_EMAIL // [REMOVED] definida: ${Boolean(process.env.// PB_ADMIN_EMAIL // [REMOVED])}\n` +
        `ENV // PB_ADMIN_PASSWORD // [REMOVED] definida: ${Boolean(process.env.// PB_ADMIN_PASSWORD // [REMOVED])}\n` +
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
