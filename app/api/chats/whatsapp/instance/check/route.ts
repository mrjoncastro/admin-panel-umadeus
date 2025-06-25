// ./app/api/chats/whatsapp/instance/check/route.ts

import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { requireRole } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) return NextResponse.json(null, { status: 200 })

  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json(null, { status: 200 })
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

  if (list.length === 0) return NextResponse.json(null, { status: 200 })

  const rec = list[0]
  return NextResponse.json(
    {
      instanceName: rec.instanceName,
      apiKey: rec.apiKey,
      sessionStatus: rec.sessionStatus,
    },
    { status: 200 },
  )
}
