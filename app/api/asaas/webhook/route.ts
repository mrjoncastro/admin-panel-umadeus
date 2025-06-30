import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { RecordModel } from 'pocketbase'

// Tipos específicos para respostas da API Asaas
type AsaasWebhookPayload = {
  payment?: {
    id?: string
    accountId?: string
    externalReference?: string
    customer?: string
  }
  event?: string
  accountId?: string
}

interface AsaasPaymentResponse {
  id: string
  accountId: string
  externalReference?: string
  customer?: string
  status: string
  value: number
}

interface AsaasCustomerResponse {
  cpfCnpj?: string
}

interface ClienteRecord extends RecordModel {
  asaas_api_key?: string
  nome?: string
}

interface PedidoRecord extends RecordModel {
  id_pagamento?: string
  responsavel?: string
}

interface InscricaoRecord extends RecordModel {
  criado_por?: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const pb = createPocketBase()
  const baseUrl = process.env.ASAAS_API_URL

  // Lê e valida corpo da requisição
  let body: AsaasWebhookPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Autenticação no PocketBase
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const payment = body.payment
  const paymentId = payment?.id
  const eventType = body.event

  // Ignora se não for evento de pagamento
  if (!paymentId) {
    return NextResponse.json({ status: 'Ignorado' })
  }
  if (eventType !== 'PAYMENT_RECEIVED' && eventType !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ status: 'Ignorado' })
  }

  // Busca credenciais do cliente na coleção "m24_clientes"
  let clienteApiKey: string | null = null
  let clienteNome: string | undefined
  let usuarioId: string | undefined
  let inscricaoId: string | undefined

  const accountId = payment.accountId || body.accountId
  if (accountId) {
    try {
      const cliente = await pb
        .collection('m24_clientes')
        .getFirstListItem<ClienteRecord>(`asaas_account_id = "${accountId}"`)
      clienteApiKey = cliente.asaas_api_key ?? null
      clienteNome = cliente.nome
    } catch {
      // não encontrado por accountId
    }
  }

  // Extrai informações de referência externa
  if (payment.externalReference) {
    const match = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      payment.externalReference,
    )
    if (match) {
      usuarioId = match[2]
      inscricaoId = match[3]
      // Se ainda não temos apiKey, tentamos buscar pelo clienteId extraído
      const clienteId = match[1]
      if (!clienteApiKey && clienteId) {
        try {
          const fallback = await pb
            .collection('m24_clientes')
            .getOne<ClienteRecord>(clienteId)
          clienteApiKey = fallback.asaas_api_key ?? null
          clienteNome = fallback.nome
        } catch {
          // ignore
        }
      }
    }
  }

  if (!clienteApiKey) {
    await logConciliacaoErro(
      `Cliente não encontrado (accountId: ${accountId ?? 'indefinido'}, externalReference: ${payment.externalReference ?? 'indefinido'})`,
    )
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 },
    )
  }

  // Prepara cabeçalho de autenticação para Asaas
  const keyHeader = clienteApiKey.startsWith('$')
    ? clienteApiKey
    : `$${clienteApiKey}`

  // Puxa dados do pagamento na API do Asaas
  const paymentRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
    headers: {
      Accept: 'application/json',
      'access-token': keyHeader,
      'User-Agent': clienteNome ?? 'qg3',
    },
  })

  if (!paymentRes.ok) {
    const details = await paymentRes.text()
    return NextResponse.json(
      { error: 'Falha ao obter pagamento', details },
      { status: 500 },
    )
  }

  const paymentData = (await paymentRes.json()) as AsaasPaymentResponse
  const {
    status,
    externalReference,
    customer: asaasCustomerId,
    value,
  } = paymentData

  // Ignora se não confirmado ou recebido
  if (status !== 'RECEIVED' && status !== 'CONFIRMED') {
    return NextResponse.json({ status: 'Aguardando pagamento' })
  }

  // Extrai inscricaoId se não obtido antes
  if (externalReference && !inscricaoId) {
    const match = /cliente_[^_]+_usuario_[^_]+_inscricao_([^_]+)/.exec(
      externalReference,
    )
    inscricaoId = match?.[1]
  }

  // Busca registro de pedido no PocketBase
  let pedidoRecord: PedidoRecord | null = null
  try {
    const filtro = inscricaoId
      ? usuarioId
        ? `id_inscricao = "${inscricaoId}" && responsavel = "${usuarioId}"`
        : `id_inscricao = "${inscricaoId}"`
      : usuarioId
        ? `id_pagamento = "${paymentId}" && responsavel = "${usuarioId}"`
        : `id_pagamento = "${paymentId}"`
    pedidoRecord = await pb
      .collection('pedidos')
      .getFirstListItem<PedidoRecord>(filtro)
  } catch {
    // ainda sem registro
  }

  // Se não encontrou, tenta via CPF do customer no Asaas
  if (!pedidoRecord && asaasCustomerId) {
    try {
      const clienteRes = await fetch(
        `${baseUrl}/customers/${asaasCustomerId}`,
        { headers: { Accept: 'application/json', 'access-token': keyHeader } },
      )
      if (clienteRes.ok) {
        const clienteData = (await clienteRes.json()) as AsaasCustomerResponse
        const cpf = clienteData.cpfCnpj?.replace(/\D/g, '')
        if (cpf) {
          const pedidos = await pb
            .collection('pedidos')
            .getList<PedidoRecord>(1, 1, {
              filter: `cpf = "${cpf}"`,
              sort: '-created',
            })
          if (pedidos.items.length > 0) {
            pedidoRecord = pedidos.items[0]
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!pedidoRecord) {
    await logConciliacaoErro(
      `Pedido não encontrado para pagamento ${paymentId}`,
    )
    return NextResponse.json(
      { error: 'Pedido não encontrado' },
      { status: 404 },
    )
  }

  // Atualiza status do pedido e inscrição
  try {
    await pb.collection('pedidos').update(pedidoRecord.id, {
      status: 'pago',
      id_pagamento: paymentId,
    })

    if (inscricaoId) {
      await pb.collection('inscricoes').update<InscricaoRecord>(inscricaoId, {
        status: 'confirmado',
      })
    }

    // Identifica responsável para notificações
    let responsavelId = pedidoRecord.responsavel
    if (!responsavelId && inscricaoId) {
      try {
        const inscricao = await pb
          .collection('inscricoes')
          .getOne<InscricaoRecord>(inscricaoId)
        responsavelId = inscricao.criado_por
      } catch {
        // ignore
      }
    }

    if (responsavelId) {
      const base = req.nextUrl.origin || req.headers.get('origin')
      if (!base) {
        throw new Error('Base URL não encontrada para notificações')
      }

      // Envia e-mail de confirmação
      await fetch(`${base}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'confirmacao_pagamento',
          userId: responsavelId,
          amount: value,
        }),
      })

      // Envia WhatsApp de confirmação
      await fetch(`${base}/api/chats/message/sendWelcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'confirmacao_pagamento',
          userId: responsavelId,
        }),
      })
    }
  } catch (error) {
    await logConciliacaoErro(
      `Falha ao atualizar pedido ${pedidoRecord.id}: ${String(error)}`,
    )
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 },
    )
  }

  return NextResponse.json({ status: 'Pedido atualizado com sucesso' })
}
