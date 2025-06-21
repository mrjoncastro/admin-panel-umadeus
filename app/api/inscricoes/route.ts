import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { createPocketBase } from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { PaymentMethod } from '@/lib/asaasFees'
interface DadosInscricao {
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string
  genero: string
  evento: string
  campo: string
  criado_por: string
  status: 'pendente'
  produto: string
  tamanho?: string
  cliente?: string
  paymentMethod: PaymentMethod
  installments: number
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const inscricoes = await pb.collection('inscricoes').getFullList({
      filter: `criado_por = "${user.id}"`,
      expand: 'evento',
      sort: '-created',
    })
    return NextResponse.json(inscricoes, { status: 200 })
  } catch (err) {
    console.error('Erro ao listar inscricoes:', err)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const body = await req.json()
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      tamanho,
      produtoId,
      genero,
      paymentMethod = 'pix',
      installments = 1,
      liderId,
      eventoId,
      evento: eventoBody,
    } = body

    // Limpa CPF e telefone
    const cpfNumerico = cpf.replace(/\D/g, '')
    const telefoneNumerico = telefone.replace(/\D/g, '')

    // Validação de campos obrigatórios
    const eventoIdFinal: string | undefined = eventoId || eventoBody

    const camposObrigatorios = [
      nome,
      email,
      telefoneNumerico,
      cpfNumerico,
      data_nascimento,
      genero,
      liderId,
      eventoIdFinal,
    ]

    if (camposObrigatorios.some((campo) => !campo || campo.trim() === '')) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios.' },
        { status: 400 },
      )
    }

    if (!['masculino', 'feminino'].includes(genero.toLowerCase())) {
      return NextResponse.json(
        { erro: "Gênero inválido. Use 'masculino' ou 'feminino'." },
        { status: 400 },
      )
    }

    if (!['pix', 'boleto', 'credito'].includes(paymentMethod)) {
      return NextResponse.json(
        { erro: 'Forma de pagamento inválida.' },
        { status: 400 },
      )
    }

    if (installments < 1) {
      return NextResponse.json(
        { erro: 'Número de parcelas inválido.' },
        { status: 400 },
      )
    }

    const lider = await pb.collection('usuarios').getOne(liderId, {
      expand: 'campo',
    })

    const campoId = lider.expand?.campo?.id

    if (!campoId) {
      return NextResponse.json(
        { erro: 'Campo do líder não encontrado.' },
        { status: 404 },
      )
    }

    // Verifica duplicidade por telefone ou CPF
    try {
      await pb
        .collection('inscricoes')
        .getFirstListItem(
          `telefone="${telefoneNumerico}" || cpf="${cpfNumerico}"`,
        )
      return NextResponse.json(
        {
          erro: 'Telefone ou CPF já cadastrado. Acesse /admin/inscricoes/recuperar para obter o link.',
        },
        { status: 409 },
      )
    } catch {
      // OK - não encontrado
    }

    // Cria inscrição SEM pedido
    const dadosInscricao: DadosInscricao = {
      nome,
      email,
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      data_nascimento,
      genero,
      evento: eventoIdFinal!,
      campo: campoId,
      criado_por: liderId,
      status: 'pendente',
      produto: produtoId,
      cliente: lider.cliente,
      paymentMethod,
      installments,
    }
    if (tamanho) dadosInscricao.tamanho = tamanho

    const inscricao = await pb.collection('inscricoes').create(dadosInscricao)

    const evento = await pb.collection('eventos').getOne(eventoIdFinal!)

    let link_pagamento: string | undefined

    try {
      const cfg = await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${lider.cliente}'`)

      if (cfg?.confirma_inscricoes === false && evento.cobra_inscricao) {
        const base = req.nextUrl.origin

        const pedidoRes = await fetch(`${base}/api/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inscricaoId: inscricao.id }),
        })

        if (pedidoRes.ok) {
          const { pedidoId, valor } = await pedidoRes.json()

          const asaasRes = await fetch(`${base}/api/asaas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pedidoId,
              valorBruto: valor,
              paymentMethod,
              installments,
            }),
          })

          if (asaasRes.ok) {
            const data = await asaasRes.json()
            link_pagamento = data.url
          } else {
            await pb.collection('pedidos').delete(pedidoId)
          }
        }
      }
    } catch (e) {
      console.error('Erro ao gerar pagamento automático:', e)
    }

    const responseData: Record<string, unknown> = {
      sucesso: true,
      inscricaoId: inscricao.id,
      nome,
      email,
      tamanho,
      produto: produtoId,
      genero,
      responsavel: liderId,
    }

    if (link_pagamento) {
      responseData.link_pagamento = link_pagamento
    }

    return NextResponse.json(responseData)
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar inscrição: ${String(err)}`)
    return NextResponse.json(
      { erro: 'Erro ao processar a inscrição.' },
      { status: 500 },
    )
  }
}
