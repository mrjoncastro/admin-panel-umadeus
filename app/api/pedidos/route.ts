import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { Inscricao, Pedido, Produto } from '@/types'
import colorName from 'color-name'

// Função para hex -> RGB array
function hexToRgb(hex: string): [number, number, number] | null {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return res
    ? [parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16)]
    : null
}

// Distância entre dois arrays RGB
function rgbDistance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2),
  )
}

// Hex para nome em inglês (do color-name)
function hexToColorName(hex: string): string {
  const targetRgb = hexToRgb(hex)
  if (!targetRgb) return 'unknown'
  let closestName = 'unknown'
  let smallestDistance = Infinity

  for (const [name, rgb] of Object.entries(colorName)) {
    const dist = rgbDistance(targetRgb, rgb as [number, number, number])
    if (dist < smallestDistance) {
      smallestDistance = dist
      closestName = name
    }
  }
  return closestName
}

// Traduzir para nomes aceitos pelo schema
const nomesPersonalizados: { [key: string]: string } = {
  maroon: 'Vinho',
  red: 'Vermelho',
  blue: 'Azul',
  teal: 'Verde-azulado',
  black: 'Preto',
  white: 'Branco',
  // ...adicione outros nomes se quiser
}

function corParaSchema(cor?: string): string {
  if (!cor) return 'Roxo'
  if (!cor.startsWith('#')) return cor
  const nomeEn = hexToColorName(cor)
  return nomesPersonalizados[nomeEn] || nomeEn
}

function normalizarGenero(valor?: string): string | undefined {
  if (!valor) return undefined
  const valorNormalizado = valor.trim().toLowerCase()
  const valoresValidos = ['masculino', 'feminino', 'outro']
  return valoresValidos.includes(valorNormalizado)
    ? valorNormalizado
    : undefined
}

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
  } catch {
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

      let produtoRecord: Produto | null = null
      try {
        if (produto) {
          const produtosList = await pb
            .collection('produtos')
            .getList<Produto>(1, 1, { filter: `nome="${produto}"` })
          produtoRecord = produtosList.items[0] || null
        }
      } catch {}

      if (produtoRecord?.requer_inscricao_aprovada) {
        try {
          const possui = await pb
            .collection('inscricoes')
            .getFirstListItem<Inscricao>(
              `criado_por='${userId}' && evento='${produtoRecord.evento_id}' && aprovada=true`,
            )
            .then(() => true)
            .catch(() => false)
          if (!possui) {
            return NextResponse.json(
              { erro: 'É necessário possuir inscrição aprovada no evento.' },
              { status: 400 },
            )
          }
        } catch {}
      }

      const corTratada = corParaSchema(cor)

      const payload = {
        id_inscricao: '',
        id_pagamento: '',
        produto: produtoRecord?.nome || produto || 'Produto',
        tamanho,
        status: 'pendente',
        cor: corTratada || 'Roxo',
        genero: normalizarGenero(genero),
        responsavel: userId,
        cliente: tenantId,
        ...(campoId ? { campo: campoId } : {}),
        email,
        valor: Number(valor) || 0,
        canal: 'loja',
      }

      try {
        const pedido = await pb.collection('pedidos').create<Pedido>(payload)

        return NextResponse.json({
          pedidoId: pedido.id,
          valor: pedido.valor,
          status: pedido.status,
        })
      } catch (err: unknown) {
        throw err
      }
    }

    // Pedido com inscrição
    let inscricao: Inscricao | null = null
    try {
      inscricao = await pb
        .collection('inscricoes')
        .getOne<Inscricao>(inscricaoId, {
          expand: 'campo,criado_por',
        })
    } catch {}

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
      } catch {}
    }

    const valor = produtoRecord?.preco ?? 0

    const payload = {
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
    }

    try {
      const pedido = await pb.collection('pedidos').create<Pedido>(payload)

      return NextResponse.json({
        pedidoId: pedido.id,
        valor: pedido.valor,
        status: pedido.status,
      })
    } catch (err: unknown) {
      throw err
    }
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar pedido: ${String(err)}`)
    return NextResponse.json({ erro: 'Erro ao criar pedido.' }, { status: 500 })
  }
}
