import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { Inscricao, Pedido, Produto } from '@/types'

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const pb = createPocketBase()
  pb.authStore.loadFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json([], { status: 401 })
  }

  const tenant = await getTenantFromHost()
  const { items } = await pb
    .collection('pedidos')
    .getList(1, 10, { filter: `cliente="${tenant}"`, sort: '-created' })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const body = await req.json()
    const { inscricaoId } = body

    if (!inscricaoId) {
      // Cria pedido da loja
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        return NextResponse.json({ erro: 'Tenant não encontrado' }, { status: 400 })
      }
      const { produto, tamanho, cor, genero, campoId, email, valor } = body
      const userId = pb.authStore.model?.id as string | undefined

      if (!userId) {
        return NextResponse.json({ erro: 'Usuário não autenticado' }, { status: 401 })
      }

      const pedido = await pb.collection('pedidos').create<Pedido>({
        id_inscricao: '',
        id_pagamento: '',
        produto: produto || 'Produto',
        tamanho,
        status: 'pendente',
        cor: cor || 'Roxo',
        genero,
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
        // noop - produtoRecord remains undefined
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
      genero:
        inscricao.genero ||
        (Array.isArray(produtoRecord?.generos)
          ? produtoRecord?.generos[0]
          : (produtoRecord?.generos as string | undefined)),
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
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar pedido: ${String(err)}`)
    return NextResponse.json({ erro: 'Erro ao criar pedido.' }, { status: 500 })
  }
}
