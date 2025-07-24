import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro, logSentryEvent } from '@/lib/server/logger'
import { pbRetry } from '@/lib/pbRetry'
import type { Inscricao, Pedido, Produto } from '@/types'
import colorName from 'color-namer'

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
  console.log('[PEDIDOS][GET] Nova requisição recebida')
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    console.log('[PEDIDOS][GET] Erro de autenticação:', auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb, user } = auth
  const page = Number(req.nextUrl.searchParams.get('page') || '1')
  const perPage = Number(req.nextUrl.searchParams.get('perPage') || '50')
  const status = req.nextUrl.searchParams.get('status') || ''
  console.log(
    '[PEDIDOS][GET] page:',
    page,
    'perPage:',
    perPage,
    'status:',
    status,
  )

  try {
    let baseFilter = ''
    if (user.role === 'usuario') {
      baseFilter = `responsavel = "${user.id}"`
    } else if (user.role === 'lider') {
      baseFilter = `campo = "${user.campo}"`
    } else {
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        console.log('[PEDIDOS][GET] Tenant não informado')
        return NextResponse.json(
          { error: 'Tenant não informado' },
          { status: 400 },
        )
      }
      baseFilter = `cliente = "${tenantId}"`
    }

    const filtro = status ? `${baseFilter} && status='${status}'` : baseFilter
    const sortParam = req.nextUrl.searchParams.get('sort') || '-created'
    console.log('[PEDIDOS][GET] Filtro final:', filtro, 'sort:', sortParam)
    const result = await pb.collection('pedidos').getList(page, perPage, {
      filter: filtro,
      sort: sortParam,
      expand: 'campo,id_inscricao,produto,responsavel',
    })
    const { items } = result

    // Caso a expansão de produto falhe, buscar manualmente
    for (const item of items) {
      if (!item.expand?.produto && item.produto) {
        const ids = Array.isArray(item.produto) ? item.produto : [item.produto]
        const produtos = await Promise.all(
          ids.map((id) =>
            pb
              .collection('produtos')
              .getOne<Produto>(id)
              .catch(() => null),
          ),
        )
        const valid = produtos.filter(Boolean) as Produto[]
        item.expand = {
          ...item.expand,
          produto: ids.length > 1 ? valid : valid[0],
        }
      }
    }

    console.log('[PEDIDOS][GET] Retornando pedidos:', items.length)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[PEDIDOS][GET] Erro ao listar:', err)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('[PEDIDOS][POST] Nova requisição recebida')
  const body = await req.json()
  const isAvulso =
    body.canal === 'avulso' && !body.id_inscricao && !body.inscricaoId
  let user
  let pb
  if (isAvulso) {
    const auth = requireRole(req, 'lider')
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    user = auth.user
    pb = auth.pb
  } else {
    const auth = getUserFromHeaders(req)
    console.log('[PEDIDOS][POST] Auth:', auth)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    user = auth.user
    pb = auth.pbSafe
  }

  try {
    console.log('[PEDIDOS][POST] Body recebido:', body)
    const inscricaoId = body.id_inscricao ?? body.inscricaoId

    if (!inscricaoId) {
      console.log('[PEDIDOS][POST] Criando pedido sem inscriçãoId')
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        console.log('[PEDIDOS][POST] Tenant não encontrado')
        return NextResponse.json(
          { erro: 'Tenant não encontrado' },
          { status: 400 },
        )
      }

      const { produto, tamanho, cor, genero, campoId, email, valor } = body
      const produtoIds = Array.isArray(produto)
        ? produto
        : produto
          ? [produto]
          : []
      const userId = user.id as string
      console.log('[PEDIDOS][POST] userId:', userId)

      let produtoRecord: Produto | null = null
      try {
        if (produtoIds[0]) {
          produtoRecord = await pb
            .collection('produtos')
            .getOne<Produto>(produtoIds[0])
          console.log('[PEDIDOS][POST] produtoRecord pelo id:', produtoRecord)
        }
      } catch (e) {
        console.error('[PEDIDOS][POST] Erro ao buscar produto pelo id:', e)
      }

      if (produtoRecord?.requer_inscricao_aprovada) {
        try {
          const possui = await pb
            .collection('inscricoes')
            .getFirstListItem<Inscricao>(
              `criado_por='${userId}' && evento='${produtoRecord.evento_id}' && aprovada=true`,
            )
            .then(() => true)
            .catch(() => false)
          console.log('[PEDIDOS][POST] Possui inscrição aprovada?', possui)
          if (!possui) {
            return NextResponse.json(
              { erro: 'É necessário possuir inscrição aprovada no evento.' },
              { status: 400 },
            )
          }
        } catch (e) {
          console.error(
            '[PEDIDOS][POST] Erro ao verificar inscrição aprovada:',
            e,
          )
        }
      }

      const corTratada = corParaSchema(cor)
      console.log('[PEDIDOS][POST] corTratada:', corTratada)

      const finalCampo = isAvulso ? user.campo : campoId
      const payloadBase: Record<string, unknown> = {
        produto: produtoIds,
        tamanho,
        status: 'pendente',
        cor: corTratada || 'Roxo',
        genero: normalizarGenero(genero),
        responsavel: userId,
        cliente: tenantId,
        ...(finalCampo ? { campo: finalCampo } : {}),
        email,
        valor: Number(valor) || 0,
        paymentMethod: body.paymentMethod ?? 'pix',
        canal: isAvulso ? 'avulso' : 'loja',
      }

      const payload = Object.fromEntries(
        Object.entries(payloadBase).filter(([, v]) => v !== undefined),
      )

      if (!isAvulso) {
        payload.id_inscricao = inscricaoId || ''
      }
      console.log('[PEDIDOS][POST] Payload para criação:', payload)

      try {
        const pedido = await pbRetry(() =>
          pb.collection('pedidos').create<Pedido>(payload),
        )
        console.log('[PEDIDOS][POST] Pedido criado:', pedido)
        logSentryEvent('pedido_criado', {
          pedidoId: pedido.id,
          responsavel: userId,
        })

        let link_pagamento: string | undefined
        let idAsaas: string | undefined
        try {
          const payRes = await fetch(`${req.nextUrl.origin}/api/asaas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pedidoId: pedido.id,
              valorBruto: pedido.valor,
              paymentMethod: body.paymentMethod ?? 'pix',
            }),
          })
          if (payRes.ok) {
            const data = await payRes.json()
            link_pagamento = data.url
            idAsaas = data.id_asaas
            await pb.collection('pedidos').update(pedido.id, {
              link_pagamento,
              ...(idAsaas ? { id_asaas: idAsaas } : {}),
            })
          }
        } catch (e) {
          console.error('[PEDIDOS][POST] Erro ao gerar cobrança:', e)
        }
        return NextResponse.json({
          pedidoId: pedido.id,
          valor: pedido.valor,
          status: pedido.status,
          ...(link_pagamento ? { link_pagamento } : {}),
          ...(idAsaas ? { id_asaas: idAsaas } : {}),
        })
      } catch (err: unknown) {
        console.error('[PEDIDOS][POST] Erro ao criar pedido:', err)
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
      console.log('[PEDIDOS][POST] Inscrição encontrada:', inscricao)
    } catch (e) {
      console.error('[PEDIDOS][POST] Erro ao buscar inscrição:', e)
    }

    if (!inscricao) {
      console.log('[PEDIDOS][POST] Inscrição não encontrada')
      return NextResponse.json(
        { erro: 'Inscrição não encontrada.' },
        { status: 404 },
      )
    }

    // Verificar se já existe pedido vinculado à inscrição
    try {
      const existente = await pb
        .collection('pedidos')
        .getFirstListItem<Pedido>(
          `id_inscricao="${inscricaoId}" && status!='cancelado'`,
        )
      if (existente) {
        console.log('[PEDIDOS][POST] Pedido existente:', existente.id)
        return NextResponse.json({
          pedidoId: existente.id,
          valor: existente.valor,
          status: existente.status,
        })
      }
    } catch (err) {
      console.log('[PEDIDOS][POST] Nenhum pedido existente encontrado')
      console.error(err)
    }

    const campoId = inscricao.expand?.campo?.id
    const responsavelId = inscricao.expand?.criado_por
    let produtoRecord: Produto | undefined
    const rawProd = inscricao.produto
    const produtoIdInscricao = Array.isArray(rawProd) ? rawProd[0] : rawProd

    try {
      if (produtoIdInscricao) {
        produtoRecord = await pb
          .collection('produtos')
          .getOne(produtoIdInscricao)
        console.log('[PEDIDOS][POST] produtoRecord pelo id:', produtoRecord)
      }
    } catch (e) {
      console.error('[PEDIDOS][POST] Erro ao buscar produto pelo id:', e)
      try {
        if (inscricao.evento) {
          const ev = await pb
            .collection('eventos')
            .getOne(inscricao.evento, { expand: 'produtos' })
          const lista = Array.isArray(ev.expand?.produtos)
            ? (ev.expand.produtos as Produto[])
            : []
          produtoRecord = lista.find((p) => p.id === produtoIdInscricao)
          console.log(
            '[PEDIDOS][POST] produtoRecord via evento:',
            produtoRecord,
          )
        }
      } catch (ee) {
        console.error('[PEDIDOS][POST] Erro ao buscar produto via evento:', ee)
      }
    }

    const valor = produtoRecord?.preco_bruto ?? 0
    console.log('[PEDIDOS][POST] Valor final do pedido:', valor)

    const payloadBase = {
      id_inscricao: inscricaoId,
      valor,
      status: 'pendente',
      id_asaas: '',
      produto: produtoIdInscricao
        ? [produtoIdInscricao]
        : produtoRecord
          ? [produtoRecord.id]
          : [],
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
    const payload = Object.fromEntries(
      Object.entries(payloadBase).filter(([, v]) => v !== undefined),
    )
    console.log('[PEDIDOS][POST] Payload com inscrição:', payload)

    try {
      const pedido = await pbRetry(() =>
        pb.collection('pedidos').create<Pedido>(payload),
      )
      console.log('[PEDIDOS][POST] Pedido criado:', pedido)
      logSentryEvent('pedido_criado', {
        pedidoId: pedido.id,
        responsavel: responsavelId,
      })

      return NextResponse.json({
        pedidoId: pedido.id,
        valor: pedido.valor,
        status: pedido.status,
      })
    } catch (err: unknown) {
      console.error('[PEDIDOS][POST] Erro ao criar pedido com inscrição:', err)
      throw err
    }
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar pedido: ${String(err)}`)
    console.error('[PEDIDOS][POST] Erro geral:', err)
    return NextResponse.json({ erro: 'Erro ao criar pedido.' }, { status: 500 })
  }
}
