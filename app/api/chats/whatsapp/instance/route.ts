// ./app/api/chats/whatsapp/instance/route.ts

import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { requireRole } from '@/lib/apiAuth'

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  // 1) valida role do usuário
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // 2) PocketBase client
  const pb = createPocketBase()
  const { pb: pbUser } = auth

  try {
    const { telefone } = await req.json()
    if (!PHONE_REGEX.test(String(telefone))) {
      return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
    }

    // 3) busca cliente e monta instanceName
    const cliente = await pbUser.collection('m24_clientes').getOne(tenant)
    const instanceName = cliente.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // 4) Create Instance + webhook (não passar token no body)
    const createRes = await fetch(
      `${process.env.EVOLUTION_API_URL}/instance/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          number: telefone,
          integration: 'WHATSAPP-BAILEYS',
          webhook: {
            url: `https://56fa-187-72-147-17.ngrok-free.app/api/chats/webhook`,
            byEvents: true,
            base64: true,
            headers: {
              'Content-Type': 'application/json',
            },
            events: ['APPLICATION_STARTUP'],
          },
        }),
      },
    )
    if (!createRes.ok) {
      const err = await createRes.json()
      console.error('Evolution API create error', err)
      return NextResponse.json(
        { error: 'evolution_create_failed', details: err },
        { status: createRes.status },
      )
    }

    // 5) parse e extrai dados
    const createJson = await createRes.json()
    console.log(
      'Evolution create response:',
      JSON.stringify(createJson, null, 2),
    )

    const instance = createJson.instance
    const apiKeyFromHash = String(createJson.hash)
    const pairingCode = createJson.qrcode.pairingCode
    const qrCodeBase64 = createJson.qrcode.base64 // data:image/png;base64,...

    // 6) autentica como admin
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    // 7) prepara dados sem o QR
    const recordData = {
      cliente: tenant,
      instanceName,
      instanceId: instance.instanceId,
      apiKey: apiKeyFromHash,
      pairingCode,
      sessionStatus: 'pending' as const,
      telefone: telefone.startsWith('+') ? telefone.slice(1) : telefone,
    }

    // 8) converte base64 em Blob (Node18+)
    const [, base64Data] = qrCodeBase64.split(',')
    const buffer = Buffer.from(base64Data, 'base64')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Node 18+
    const blob = new Blob([buffer], { type: 'image/png' })

    // 9) upsert + upload em um só passo
    const existing = await pb
      .collection('whatsapp_clientes')
      .getFullList({ filter: `cliente="${tenant}"` })

    let rec
    if (existing.length > 0) {
      rec = await pb
        .collection('whatsapp_clientes')
        .update(existing[0].id, recordData, { files: { qrCode: blob } })
    } else {
      rec = await pb
        .collection('whatsapp_clientes')
        .create(recordData, { files: { qrCode: blob } })
    }

    console.log('Registro salvo com QR upload:', rec)

    // 10) retorna ao frontend
    return NextResponse.json(
      {
        instance,
        apiKey: apiKeyFromHash,
        pairingCode,
        qrCodeUrl: rec.qrCode, // URL do arquivo
        qrBase64: qrCodeBase64.split(',')[1], // só o Base64, sem o prefixo
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('cadastro whatsapp error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
