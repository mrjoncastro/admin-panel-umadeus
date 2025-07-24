// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Inscricao } from '@/types'
// [REMOVED] PocketBase import
import { logConciliacaoErro, logRocketEvent } from '@/lib/server/logger'
import { pbRetry } from '@/lib/pbRetry'

async function checkAccess(
  inscricao: Inscricao,
  user: RecordModel,
): Promise<{ ok: true } | { error: string;import { logger } from '@/lib/logger'
 status: number }> {
  if (user.role === 'usuario') {
    if (inscricao.criado_por !== user.id) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else if (user.role === 'lider') {
    if (inscricao.campo !== user.campo) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else {
    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return { error: 'Tenant não informado', status: 400 }
    }
    if (inscricao.cliente !== tenantId) {
      return { error: 'Acesso negado', status: 403 }
    }
  }
  return { ok: true }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const expand =
      req.nextUrl.searchParams.get('expand') || 'evento,campo,pedido,produto'
    const record = await pb
      .collection('inscricoes')
      .getOne<Inscricao>(id, { expand })
    const access = await checkAccess(record, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    return NextResponse.json(record)
  } catch (err) {
    logger.error('Erro ao obter inscricao:', err)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const inscricao = await // pb. // [REMOVED] collection('inscricoes').getOne<Inscricao>(id)
    const access = await checkAccess(inscricao, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    const data = await req.json()
    const payload = { ...data }
    if (user.role === 'lider') {
      const allowed = ['aguardando_pagamento', 'cancelado']
      if (
        'status' in payload &&
        !allowed.includes((payload as { status?: string }).status ?? '')
      ) {
        delete (payload as Record<string, unknown>).status
      }
    }
    const updated = await pbRetry(() =>
      // pb. // [REMOVED] collection('inscricoes').update(id, payload),
    )
    logRocketEvent('inscricao_atualizada', {
      inscricaoId: id,
      status: updated.status,
    })
    return NextResponse.json(updated)
  } catch (err) {
    logger.error('Erro ao atualizar inscricao:', err)
    await logConciliacaoErro('Erro ao atualizar inscricao: ' + String(err))
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const inscricao = await // pb. // [REMOVED] collection('inscricoes').getOne<Inscricao>(id)
    const access = await checkAccess(inscricao, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    await // pb. // [REMOVED] collection('inscricoes').delete(id)
    logRocketEvent('inscricao_cancelada', { inscricaoId: id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('Erro ao excluir inscricao:', err)
    await logConciliacaoErro('Erro ao excluir inscricao: ' + String(err))
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
