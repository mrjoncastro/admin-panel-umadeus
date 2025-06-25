// ./app/api/chats/whatsapp/message/sendText/[instanceName]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'

export async function POST(
  req: NextRequest,
  { params }: { params: { instanceName: string } },
) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  // extrai from body
  const { to, message } = await req.json()
  if (!to || !message) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // busca apiKey no PB
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }
  // garantimos que o registro exista e trazemos apiKey
  const rec = await pb
    .collection('whatsapp_clientes')
    .getFirstListItem(`instanceName="${params.instanceName}"`)

  try {
    const result = await sendTextMessage({
      instanceName: params.instanceName,
      apiKey: rec.apiKey,
      to,
      message,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    console.error('sendText error', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
