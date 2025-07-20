import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { queueTextMessage } from '@/lib/server/chats'
import { broadcastManager } from '@/lib/server/flows/whatsapp'

export async function POST(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }

  let body: { target?: string; message?: string }
  try {
    body = (await req.json()) as { target?: string; message?: string }
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { target, message } = body
  if (!target || !message) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const cfgList = await pb
    .collection('whatsapp_clientes')
    .getFullList({ filter: `cliente="${tenant}"`, limit: 1 })
  if (cfgList.length === 0) {
    return NextResponse.json({ error: 'configuração não encontrada' }, { status: 404 })
  }
  const cfg = cfgList[0]

  let records: { telefone?: string }[] = []
  if (target === 'lideres') {
    records = await pb.collection('usuarios').getFullList({
      filter: `cliente='${tenant}' && role='lider' && telefone != ''`,
      fields: 'telefone',
    })
  } else if (target === 'inscritos') {
    records = await pb.collection('inscricoes').getFullList({
      filter: `cliente='${tenant}' && telefone != ''`,
      fields: 'telefone',
    })
  } else if (target === 'pendentes') {
    records = await pb.collection('inscricoes').getFullList({
      filter: `cliente='${tenant}' && status='pendente' && telefone != ''`,
      fields: 'telefone',
    })
  } else {
    return NextResponse.json({ error: 'Target inválido' }, { status: 400 })
  }

  const phones = Array.from(
    new Set(records.map((r) => r.telefone).filter(Boolean) as string[]),
  )

  for (const phone of phones) {
    queueTextMessage(
      {
        tenant,
        instanceName: cfg.instanceName,
        apiKey: cfg.apiKey,
        to: phone,
        message,
      },
      false,
    )
  }

  return NextResponse.json({ message: 'mensagens enfileiradas', total: phones.length })
}

export async function GET(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  const stats = broadcastManager.getStats(tenant)
  return NextResponse.json(stats)
}

export async function DELETE(req: NextRequest) {
  const tenant = req.headers.get('x-tenant-id')
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant ausente' }, { status: 400 })
  }
  broadcastManager.cancel(tenant)
  return NextResponse.json({ message: 'fila cancelada' })
}
