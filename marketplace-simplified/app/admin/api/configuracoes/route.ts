// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'
// [REMOVED] PocketBase import

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${user.cliente}'`)
    return NextResponse.json(
      {
        id: cfg.id,
        cor_primary: cfg.cor_primary ?? '',
        logo_url: cfg.logo_url ?? '',
        font: cfg.font ?? '',
        confirma_inscricoes: cfg.confirma_inscricoes ?? false,
      },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return NextResponse.json(
        { error: 'Configuração não encontrada para o cliente' },
        { status: 404 },
      )
    }
    await logConciliacaoErro(`Erro ao obter configuracoes: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const { cor_primary, font, confirma_inscricoes } = await req.json()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${user.cliente}'`)
    const updated = await // pb. // [REMOVED] collection('clientes_config').update(cfg.id, {
      cor_primary,
      logo_url: cfg.logo ? // pb. // [REMOVED] files.getUrl(cfg, cfg.logo) : '',
      font,
      confirma_inscricoes,
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return NextResponse.json(
        { error: 'Configuração não encontrada para o cliente' },
        { status: 404 },
      )
    }
    await logConciliacaoErro(`Erro ao atualizar configuracoes: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
