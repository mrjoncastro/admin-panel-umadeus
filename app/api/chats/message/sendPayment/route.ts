import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  let body: { telefone?: string; link?: string; message?: string }
  try {
    body = (await req.json()) as {
      telefone?: string
      link?: string
      message?: string
    }
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { telefone, link, message } = body
  if (!telefone || !link) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })

  if (list.length === 0) {
    return NextResponse.json(
      { error: 'registro não encontrado' },
      { status: 404 },
    )
  }

  const rec = list[0]

  try {
    const finalMessage = message ??
      `Para concluir seu pagamento, acesse: ${link}`
    const result = await sendTextMessage({
      instanceName: rec.instanceName,
      apiKey: rec.apiKey,
      to: telefone,
      message: finalMessage,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
