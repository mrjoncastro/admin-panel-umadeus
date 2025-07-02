import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Inscricao } from '@/types'
import type { RecordModel } from 'pocketbase'
import { logConciliacaoErro, logRocketEvent } from '@/lib/server/logger'
import { pbRetry } from '@/lib/pbRetry'

async function checkAccess(
  inscricao: Inscricao,
  user: RecordModel,
): Promise<{ ok: true } | { error: string; status: number }> {
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
    console.error('Erro ao obter inscricao:', err)
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
    const inscricao = await pb.collection('inscricoes').getOne<Inscricao>(id)
    const access = await checkAccess(inscricao, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    const data = await req.json()
    const updated = await pbRetry(() =>
      pb.collection('inscricoes').update(id, data),
    )
    logRocketEvent('inscricao_atualizada', {
      inscricaoId: id,
      status: updated.status,
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Erro ao atualizar inscricao:', err)
    await logConciliacaoErro('Erro ao atualizar inscricao: ' + String(err))
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const inscricao = await pb.collection('inscricoes').getOne(id)
    if (inscricao.criado_por !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    await pb.collection('inscricoes').update(id, { status: 'cancelado' })
    logRocketEvent('inscricao_cancelada', { inscricaoId: id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao cancelar inscricao:', err)
    await logConciliacaoErro('Erro ao atualizar inscricao: ' + String(err))
    return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
  }
}
