import { NextRequest, NextResponse } from 'next/server'
import { saveClient, generateQr } from '@/lib/server/chats'
import { requireRole } from '@/lib/apiAuth'

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  const auth = requireRole(req, ['coordenador', 'admin'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    const { telefone } = await req.json()
    if (!PHONE_REGEX.test(String(telefone))) {
      return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
    }
    const cliente = await pb.collection('m24_clientes').getOne(tenant)
    const instanceName = cliente.nome
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
    const record = await saveClient({
      telefone,
      instanceName,
      apiKey: process.env.EVOLUTION_API_KEY!,
    })
    await generateQr(instanceName, process.env.EVOLUTION_API_KEY!)
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    console.error('cadastro whatsapp error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
