import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { RecordModel } from 'pocketbase'

type AsaasWebhookPayload = {
  payment?: {
    id?: string
    accountId?: string
    externalReference?: string
    customer?: string
  }
  checkout?: {
    id?: string
    status?: string
    callback?: {
      successUrl?: string
      cancelUrl?: string
      expiredUrl?: string
    }
    customerData?: {
      email?: string
      cpfCnpj?: string
      name?: string
    }
  }
  event?: string
  accountId?: string
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  const baseUrl = process.env.ASAAS_API_URL

  const rawBody = await req.text()
  let body: AsaasWebhookPayload
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // --- NOVA LÓGICA PARA CHECKOUT_PAID ---
  if (body.event === 'CHECKOUT_PAID' && body.checkout?.callback?.successUrl) {
    const successUrl = body.checkout.callback.successUrl
    const pedidoMatch = /pedido=([^&]+)/.exec(successUrl)
    const pedidoId = pedidoMatch ? pedidoMatch[1] : null
    const idPagamento = body.checkout?.id

    if (pedidoId) {
      try {
        await pb.collection('pedidos').update(pedidoId, {
          status: 'pago',
          id_pagamento: idPagamento,
        })
        return NextResponse.json({
          status: 'Pedido atualizado com sucesso (checkout paid)',
        })
      } catch (err) {
        await logConciliacaoErro(
          `Falha ao atualizar pedido ${pedidoId}: ${String(err)}`,
        )
        return NextResponse.json(
          { error: 'Erro ao atualizar pedido' },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Pedido não identificado no successUrl' },
        { status: 400 },
      )
    }
  }

  // --- LÓGICA PADRÃO PARA PAYMENT_RECEIVED/PAYMENT_CONFIRMED ---
  const payment = body.payment
  const paymentId: string | undefined = payment?.id
  const event: string | undefined = body.event

  if (!paymentId) {
    return NextResponse.json({ status: 'Ignorado' })
  }

  if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ status: 'Ignorado' })
  }

  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  let clienteApiKey: string | null = null
  let clienteId: string | null = null
  let clienteNome: string | null = null
  let usuarioId: string | null = null
  let inscricaoId: string | null = null
  const accountId = payment?.accountId || body.accountId
  if (accountId) {
    try {
      const c = await pb
        .collection('clientes_config')
        .getFirstListItem(`asaas_account_id = "${accountId}"`)
      clienteApiKey = c?.asaas_api_key ?? null
      clienteId = c?.id ?? null
      clienteNome = c?.nome ?? null
    } catch {
      /* ignore */
    }
  }

  if (payment?.externalReference) {
    const match = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      payment.externalReference,
    )
    if (match) {
      clienteId = clienteId || match[1]
      usuarioId = match[2]
      inscricaoId = match[3] || null
    }
  }

  if (!clienteApiKey && clienteId) {
    try {
      const c = await pb.collection('clientes_config').getOne(clienteId)
      clienteApiKey = c?.asaas_api_key ?? null
      clienteNome = c?.nome ?? null
    } catch {
      /* ignore */
    }
  }

  if (!clienteApiKey) {
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 },
    )
  }

  logConciliacaoErro(`Webhook recebido com API Key: ${clienteApiKey}`)

  const keyHeader = clienteApiKey.startsWith('$')
    ? clienteApiKey
    : `$${clienteApiKey}`

  const paymentRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
    headers: {
      accept: 'application/json',
      'access-token': keyHeader,
      'User-Agent': clienteNome ?? 'qg3',
    },
  })

  if (!paymentRes.ok) {
    const errorBody = await paymentRes.text()
    return NextResponse.json(
      { error: 'Falha ao obter pagamento', details: errorBody },
      { status: 500 },
    )
  }

  const paymentData = await paymentRes.json()

  const status = paymentData.status as string | undefined
  const externalRef: string | undefined = paymentData.externalReference
  const asaasCustomerId: string | undefined = paymentData.customer

  if (status !== 'RECEIVED' && status !== 'CONFIRMED') {
    return NextResponse.json({ status: 'Aguardando pagamento' })
  }

  if (externalRef && !inscricaoId) {
    const m = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      externalRef,
    )
    if (m) {
      inscricaoId = m[3] || null
    }
  }

  let pedidoRecord: RecordModel | null = null

  // 1. Busca padrão (inscricao/pagamento)
  try {
    if (inscricaoId) {
      const filtro = usuarioId
        ? `id_inscricao = "${inscricaoId}" && responsavel = "${usuarioId}"`
        : `id_inscricao = "${inscricaoId}"`
      pedidoRecord = await pb.collection('pedidos').getFirstListItem(filtro)
    } else {
      const filtro = usuarioId
        ? `id_pagamento = "${paymentId}" && responsavel = "${usuarioId}"`
        : `id_pagamento = "${paymentId}"`
      pedidoRecord = await pb.collection('pedidos').getFirstListItem(filtro)
    }
  } catch {
    /* ignore */
  }

  // 2. Busca pelo customer do Asaas (API Asaas -> CPF -> Pedido)
  if (!pedidoRecord && asaasCustomerId) {
    try {
      // Busca cliente no Asaas para obter CPF
      const clienteRes = await fetch(
        `${baseUrl}/customers/${asaasCustomerId}`,
        {
          headers: {
            accept: 'application/json',
            'access-token': keyHeader,
            'User-Agent': clienteNome ?? 'qg3',
          },
        },
      )
      if (clienteRes.ok) {
        const clienteData = await clienteRes.json()
        const cpf = clienteData.cpfCnpj?.replace(/\D/g, '') // tira pontos/traços
        if (cpf) {
          // Busca pedido mais recente pelo CPF
          const pedidos = await pb
            .collection('pedidos')
            .getList(1, 1, { filter: `cpf = "${cpf}"`, sort: '-created' })
          if (pedidos?.items?.length > 0) {
            pedidoRecord = pedidos.items[0]
          }
        }
      }
    } catch {
      // Cliente não encontrado no Asaas ou erro, segue fluxo
    }
  }

  if (!pedidoRecord) {
    await logConciliacaoErro(
      `Pedido nao encontrado para pagamento ${paymentId}`,
    )
    return NextResponse.json(
      { error: 'Pedido não encontrado' },
      { status: 404 },
    )
  }

  try {
    await pb.collection('pedidos').update(pedidoRecord.id, {
      status: 'pago',
      id_pagamento: paymentId,
    })

    // Atualiza inscrição, se aplicável
    if (inscricaoId) {
      await pb.collection('inscricoes').update(inscricaoId, {
        status: 'confirmado',
      })
    }
  } catch (err) {
    await logConciliacaoErro(
      `Falha ao atualizar pedido ${pedidoRecord.id}: ${String(err)}`,
    )
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 },
    )
  }

  return NextResponse.json({ status: 'Pedido atualizado com sucesso' })
}
