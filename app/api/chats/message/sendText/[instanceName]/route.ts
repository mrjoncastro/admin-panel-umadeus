// ./app/api/chats/message/sendText/[instanceName]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { queueTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ instanceName?: string }> },
) {
  // 1) precisa fazer await em context.params
  const { instanceName } = await context.params
  console.log('[sendText] instanceName:', instanceName)

  if (!instanceName) {
    return NextResponse.json({ error: 'instanceName missing' }, { status: 400 })
  }

  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  let body: { to?: string; message?: string }
  try {
    body = (await req.json()) as { to?: string; message?: string }
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  const { to, message } = body
  if (!to || !message) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // 2) pega apiKey do PB
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  let rec
  try {
    rec = await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`instanceName="${instanceName}"`)
  } catch {
    return NextResponse.json(
      { error: 'registro não encontrado' },
      { status: 404 },
    )
  }

  // 3) envia mensagem com controle
  try {
    const result = await queueTextMessage({
      tenant,
      instanceName,
      apiKey: rec.apiKey,
      to,
      message,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    console.error('[sendText] sendTextMessage error:', err)
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
