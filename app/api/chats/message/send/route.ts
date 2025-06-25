import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, getClient } from '@/lib/server/chats'
import { requireRole } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { to, message, mediaUrl } = await req.json()
  try {
    const pbRecord = await getClient(auth.user.cliente)
    const record = pbRecord || (await getClient(tenant))
    if (!record) {
      return NextResponse.json({ error: 'instancia_nao_encontrada' }, { status: 404 })
    }
    await sendMessage({
      instanceName: record.instanceName,
      apiKey: record.apiKey,
      to,
      message,
      mediaUrl,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send message error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
