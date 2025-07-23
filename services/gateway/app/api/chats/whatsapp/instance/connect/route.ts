// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { logger } from '@/lib/logger'
// ./app/api/chats/whatsapp/instance/connect/route.ts

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { requireRole } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  // valida role
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { instanceName, apiKey } = await req.json()
  if (typeof instanceName !== 'string' || typeof apiKey !== 'string') {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  // 1) verifica existência no PocketBase
  // const pb = createPocketBase() // [REMOVED]
  if (!// pb. // [REMOVED] authStore.isValid) {
    await // pb. // [REMOVED] admins.authWithPassword(
      process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
      process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
    )
  }
  const list = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `instanceName="${instanceName}"` })

  if (list.length === 0) {
    return NextResponse.json(
      {
        error: 'instance_not_found',
        message: 'Instância não encontrada no PB',
      },
      { status: 404 },
    )
  }

  // 2) chama Evolution API connect
  const connectRes = await fetch(
    `${process.env.EVOLUTION_API_URL}/instance/connect/${instanceName}`,
    {
      method: 'GET',
      headers: { apikey: apiKey },
    },
  )
  if (!connectRes.ok) {
    const err = await connectRes.json().catch(() => ({}))
    logger.error('Evolution API connect error', err)
    return NextResponse.json(
      { error: 'evolution_connect_failed', details: err },
      { status: connectRes.status },
    )
  }
  const json = (await connectRes.json()) as {
    pairingCode: string
    code?: string
    base64?: string
  }

  // 3) extrai dataURI
  const raw = json.base64 ?? json.code!
  const dataUri = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`

  // 4) faz upload do novo QR no PB
  const [, base64Data] = dataUri.split(',')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Node 18+
  const blob = new Blob([Buffer.from(base64Data, 'base64')], {
    type: 'image/png',
  })

  // reusa o primeiro registro encontrado
  const rec = list[0]
  const updated = await pb
    .collection('whatsapp_clientes')
    .update(rec.id, {}, { files: { qrCode: blob } })

  // 5) responde pro front
  return NextResponse.json(
    {
      pairingCode: json.pairingCode,
      qrCodeUrl: updated.qrCode,
      qrBase64: base64Data,
    },
    { status: 200 },
  )
}
