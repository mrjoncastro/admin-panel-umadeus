// ./app/api/chats/whatsapp/instance/connectionState/route.ts

import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
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

  const { instanceName, apiKey } = await req.json()
  if (!instanceName || !apiKey) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // 1) ask Evolution for connection state
  const res = await fetch(
    `${process.env.EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
    { headers: { apikey: apiKey } },
  )
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: 'evolution_state_failed', details: e },
      { status: res.status },
    )
  }
  const json = (await res.json()) as {
    status: 'pending' | 'connected' | 'disconnected'
  }

  // 2) if connected, update PB
  if (json.status === 'connected') {
    const pb = createPocketBase()
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }
    // find the record by instanceName
    const list = await pb
      .collection('whatsapp_clientes')
      .getFullList({ filter: `instanceName="${instanceName}"` })
    if (list.length > 0) {
      await pb
        .collection('whatsapp_clientes')
        .update(list[0].id, { sessionStatus: 'connected' })
    }
  }

  return NextResponse.json(json, { status: 200 })
}
