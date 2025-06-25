// ./app/api/chats/whatsapp/message/sendTest/[instanceName]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ instanceName?: string }> },
) {
  // 1) pegamos o instanceName
  const { instanceName } = await context.params
  if (!instanceName) {
    return NextResponse.json({ error: 'instanceName missing' }, { status: 400 })
  }

  // 2) tenant
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  // 3) init PocketBase + lookup
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

  // 4) se já rodou o teste, não dispara de novo
  if (rec.config_finished) {
    return NextResponse.json({ error: 'Teste já executado' }, { status: 409 })
  }

  // 5) lê body (to + message opcional)
  const { to, message } = await req.json().catch(() => ({}))
  if (!to) {
    return NextResponse.json(
      { error: 'Número de destino obrigatório' },
      { status: 400 },
    )
  }

  // mensagem padrão de teste, se não vier custom
  const text =
    typeof message === 'string' ? message : 'Olá! QR autenticado com sucesso!'

  // 6) envia
  try {
    const result = await sendTextMessage({
      instanceName,
      apiKey: rec.apiKey,
      to,
      message: text,
    })

    // 7) marca como configurado
    await pb
      .collection('whatsapp_clientes')
      .update(rec.id, { config_finished: true })

    return NextResponse.json({ ok: true, result }, { status: 200 })
  } catch (err) {
    console.error('[sendTest] erro ao enviar teste:', err)
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
