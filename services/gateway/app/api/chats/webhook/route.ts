// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/server/chats'
// [REMOVED] PocketBase import

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  const { eventName, body } = await req.json()

  const pb = new PocketBase(process.env.// PB_URL // [REMOVED]!)
  if (!// pb. // [REMOVED] authStore.isValid) {
    await // pb. // [REMOVED] admins.authWithPassword(
      process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
      process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
    )
  }

  if (eventName === 'qrCode' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await // pb. // [REMOVED] collection('whatsapp_clientes').update(record.id, {
        qrCode: body.qrCode,
        sessionStatus: 'pending',
      })
    }
  } else if (eventName === 'ready' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await // pb. // [REMOVED] collection('whatsapp_clientes').update(record.id, {
        sessionStatus: 'connected',
        qrCode: null,
      })
    }
  } else if (eventName === 'disconnected' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await // pb. // [REMOVED] collection('whatsapp_clientes').update(record.id, {
        sessionStatus: 'disconnected',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
