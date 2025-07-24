// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logInfo } from '@/lib/logger'
import { logConciliacaoErro } from '@/lib/server/logger'
import { calculateGross } from '@/lib/asaasFees'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const produtos = await // pb. // [REMOVED] collection('produtos').getFullList({
      sort: '-created',
      filter: `user_org = "${user.id}" && cliente="${user.cliente}"`,
    })
    return NextResponse.json(produtos, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao listar produtos: ${String(err)} | host: ${// pb. // [REMOVED] baseUrl} | user: ${user.id}`,
    )
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
    const formData = await req.formData()
    formData.set('user_org', user.id)
    formData.set('cliente', user.cliente as string)
    const preco = Number(formData.get('preco') || 0)
    const bruto = calculateGross(preco, 'pix', 1).gross
    formData.set('preco_bruto', String(bruto))
    const keys = Array.from(formData.keys())
    logInfo('Criando produto', {
      pbHost: // pb. // [REMOVED] baseUrl,
      userId: user.id,
      keys,
    })
    const produto = await // pb. // [REMOVED] collection('produtos').create(formData)
    return NextResponse.json(produto, { status: 201 })
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao criar produto: ${String(err)} | host: ${// pb. // [REMOVED] baseUrl} | user: ${user.id}`,
    )
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 })
  }
}
