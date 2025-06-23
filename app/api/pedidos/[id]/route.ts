import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Pedido, Produto } from '@/types'
import type { RecordModel } from 'pocketbase'

async function checkAccess(
  pedido: Pedido,
  user: RecordModel,
): Promise<{ ok: true } | { error: string; status: number }> {
  if (user.role === 'usuario') {
    if (pedido.responsavel !== user.id) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else if (user.role === 'lider') {
    if (pedido.campo !== user.campo) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else {
    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return { error: 'Tenant não informado', status: 400 }
    }
    if (pedido.cliente !== tenantId) {
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
    const pedido = await pb.collection('pedidos').getOne<Pedido>(id, {
      expand: 'campo,responsavel,id_inscricao,id_inscricao.criado_por,produto',
    })

    // Garantir dados do produto mesmo se expand falhar
    if (!pedido.expand?.produto && pedido.produto) {
      const ids = Array.isArray(pedido.produto)
        ? pedido.produto
        : [pedido.produto]
      const produtos = await Promise.all(
        ids.map((pid) =>
          pb
            .collection('produtos')
            .getOne<Produto>(pid)
            .catch(() => null),
        ),
      )
      const validProds = produtos.filter(Boolean) as Produto[]
      pedido.expand = {
        ...pedido.expand,
        produto: ids.length > 1 ? validProds : validProds[0],
      }
    }
    const access = await checkAccess(pedido, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    return NextResponse.json(pedido)
  } catch (err) {
    console.error('Erro ao obter pedido:', err)
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
    const pedido = await pb.collection('pedidos').getOne<Pedido>(id)
    const access = await checkAccess(pedido, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    const data = await req.json()
    const updated = await pb.collection('pedidos').update(id, {
      ...(data.produto !== undefined ? { produto: String(data.produto) } : {}),
      ...(data.email !== undefined ? { email: String(data.email) } : {}),
      ...(data.tamanho !== undefined ? { tamanho: String(data.tamanho) } : {}),
      ...(data.cor !== undefined ? { cor: String(data.cor) } : {}),
      ...(data.status !== undefined ? { status: String(data.status) } : {}),
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const pedido = await pb.collection('pedidos').getOne<Pedido>(id)
    const access = await checkAccess(pedido, user)
    if ('error' in access) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      )
    }
    await pb.collection('pedidos').delete(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao excluir pedido:', err)
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
