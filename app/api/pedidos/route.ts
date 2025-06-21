import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { Inscricao, Pedido, Produto } from '@/types'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth
  const page = Number(req.nextUrl.searchParams.get('page') || '1')
  const perPage = Number(req.nextUrl.searchParams.get('perPage') || '50')
  const status = req.nextUrl.searchParams.get('status') || ''

  try {
    let baseFilter = ''
    if (user.role === 'usuario') {
      baseFilter = `responsavel = "${user.id}"`
    } else if (user.role === 'lider') {
      baseFilter = `campo = "${user.campo}"`
    } else {
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        return NextResponse.json(
          { error: 'Tenant não informado' },
          { status: 400 },
        )
      }
      baseFilter = `cliente = "${tenantId}"`
    }

    const filtro = status ? `${baseFilter} && status='${status}'` : baseFilter
    const { items } = await pb.collection('pedidos').getList(page, perPage, {
      filter: filtro,
      sort: '-created',
      expand: 'campo,id_inscricao',
    })

    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  const pb = 'error' in auth ? createPocketBase(false) : auth.pbSafe

  try {
    const body = await req.json()
    const { inscricaoId } = body

    if (!inscricaoId) {
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        return NextResponse.json(
          { erro: 'Tenant não encontrado' },
          { status: 400 },
        )
      }

      const { produto, tamanho, cor, genero, campoId, email, valor } = body
      const userId = 'error' in auth ? undefined : (auth.user.id as string)

      if (!userId) {
        return NextResponse.json(
          { erro: 'Usuário não autenticado' },
          { status: 401 },
        )
      }

      const pedido = await pb.collection('pedidos').create<Pedido>({
        id_inscricao: '',
        id_pagamento: '',
        produto: produto || 'Produto',
        tamanho,
        status: 'pendente',
        cor: cor || 'Roxo',
        genero: normalizarGenero(genero),
        responsavel: userId,
        cliente: tenantId,
        ...(campoId ? { campo: campoId } : {}),
        email,
        valor: valor ?? 0,
        canal: 'loja',
      })

      return NextResponse.json({
        pedidoId: pedido.id,
        valor: pedido.valor,
        status: pedido.status,
      })
    }

    const inscricao = await pb
      .collection('inscricoes')
      .getOne<Inscricao>(inscricaoId, {
        expand: 'campo,criado_por',
      })

    if (!inscricao) {
      return NextResponse.json(
        { erro: 'Inscrição não encontrada.' },
        { status: 404 },
      )
    }

    const campoId = inscricao.expand?.campo?.id
    const responsavelId = inscricao.expand?.criado_por
    let produtoRecord: Produto | undefined

    try {
      if (inscricao.produto) {
        produtoRecord = await pb
          .collection('produtos')
          .getOne(inscricao.produto)
      }
    } catch {
      try {
        if (inscricao.evento) {
          const ev = await pb
            .collection('eventos')
            .getOne(inscricao.evento, { expand: 'produtos' })
          const lista = Array.isArray(ev.expand?.produtos)
            ? (ev.expand.produtos as Produto[])
            : []
          produtoRecord = lista.find((p) => p.id === inscricao.produto)
        }
      } catch {
        // noop
      }
    }

    const valor = produtoRecord?.preco ?? 0

    const pedido = await pb.collection('pedidos').create<Pedido>({
      id_inscricao: inscricaoId,
      valor,
      status: 'pendente',
      produto: produtoRecord?.nome || inscricao.produto || 'Produto',
      cor: 'Roxo',
      tamanho:
        inscricao.tamanho ||
        (Array.isArray(produtoRecord?.tamanhos)
          ? produtoRecord?.tamanhos[0]
          : (produtoRecord?.tamanhos as string | undefined)),
      genero: normalizarGenero(
        inscricao.genero ||
          (Array.isArray(produtoRecord?.generos)
            ? produtoRecord?.generos[0]
            : (produtoRecord?.generos as string | undefined)),
      ),
      email: inscricao.email,
      campo: campoId,
      responsavel: responsavelId,
      cliente: inscricao.cliente,
      canal: 'inscricao',
    })

    return NextResponse.json({
      pedidoId: pedido.id,
      valor: pedido.valor,
      status: pedido.status,
    })
  } catch (err: any) {
    await logConciliacaoErro(`Erro ao criar pedido: ${String(err)}`)
    return NextResponse.json({ erro: 'Erro ao criar pedido.' }, { status: 500 })
  }
}

function normalizarGenero(valor?: string): string | undefined {
  if (!valor) return undefined

  const valorNormalizado = valor.trim().toLowerCase()
  const valoresValidos = ['masculino', 'feminino', 'outro']

  return valoresValidos.includes(valorNormalizado)
    ? valorNormalizado
    : undefined
}
