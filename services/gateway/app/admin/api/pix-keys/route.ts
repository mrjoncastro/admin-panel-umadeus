import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const keys = await pb.collection('clientes_pix').getFullList({
      filter: `cliente='${user.cliente}'`,
    })
    return NextResponse.json(keys, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar pix: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const body = await req.json()
    const record = await pb.collection('clientes_pix').create({
      ...body,
      usuario: user.id,
      cliente: user.cliente,
    })
    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao criar pix: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
  }
}
