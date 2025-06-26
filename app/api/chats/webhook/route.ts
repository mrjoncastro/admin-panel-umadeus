import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/server/chats'
import PocketBase from 'pocketbase'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  const { eventName, body } = await req.json()

  const pb = new PocketBase(process.env.PB_URL!)
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  if (eventName === 'qrCode' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await pb.collection('whatsapp_clientes').update(record.id, {
        qrCode: body.qrCode,
        sessionStatus: 'pending',
      })
    }
  } else if (eventName === 'ready' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await pb.collection('whatsapp_clientes').update(record.id, {
        sessionStatus: 'connected',
        qrCode: null,
      })
    }
  } else if (eventName === 'disconnected' && body?.instanceName) {
    const record = await getClient(body.instanceName)
    if (record) {
      await pb.collection('whatsapp_clientes').update(record.id, {
        sessionStatus: 'disconnected',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
