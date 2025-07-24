// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    const data = await req.json()
    const chave = await // pb. // [REMOVED] collection('clientes_pix').update(id, data)
    return NextResponse.json(chave, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao atualizar pix: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    await // pb. // [REMOVED] collection('clientes_pix').delete(id)
    return NextResponse.json({ sucesso: true }, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao excluir pix: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
