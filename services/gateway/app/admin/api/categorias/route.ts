// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

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
    const categorias = await // pb. // [REMOVED] collection('categorias').getFullList({
      sort: 'nome',
      filter: `cliente='${user.cliente}'`,
    })
    return NextResponse.json(categorias, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar categorias: ${String(err)}`)
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
    const { nome } = await req.json()
    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    const slug = nome.toLowerCase().replace(/\s+/g, '-')
    const categoria = await pb
      .collection('categorias')
      .create({ nome, slug, cliente: user.cliente })
    return NextResponse.json(categoria, { status: 201 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao criar categoria: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
  }
}
