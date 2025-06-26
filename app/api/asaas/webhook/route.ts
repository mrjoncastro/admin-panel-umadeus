// ./app/api/asaas/webhook/route.ts
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

  // Garantir autenticação antes de tudo
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  // --- Apenas eventos de pagamento ---
  const payment = body.payment
  const paymentId: string | undefined = payment?.id
  const event: string | undefined = body.event

  if (!paymentId) {
    return NextResponse.json({ status: 'Ignorado' })
  }

  if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ status: 'Ignorado' })
  }

  // Buscar configs do cliente pelo accountId, se disponível
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

  // Puxa dados do pagamento na API do Asaas
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

  // Busca pelo pedido
  if (externalRef && !inscricaoId) {
    const m = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      externalRef,
    )
    if (m) {
      inscricaoId = m[3] || null
    }
  }

  let pedidoRecord: RecordModel | null = null

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
    // ignore
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
        const cpf = clienteData.cpfCnpj?.replace(/\D/g, '')
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

    // Identifica o usuário responsável
    let responsavelId: string | undefined = (
      pedidoRecord as { responsavel?: string }
    ).responsavel
    if (!responsavelId && inscricaoId) {
      try {
        const inscricao = await pb.collection('inscricoes').getOne(inscricaoId)
        responsavelId = (inscricao as { criado_por?: string }).criado_por
      } catch {
        /* ignore */
      }
    }

    if (responsavelId) {
      const base = req.nextUrl.origin

      try {
        await fetch(`${base}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_pagamento',
            userId: responsavelId,
          }),
        })
      } catch (err) {
        await logConciliacaoErro(
          `Falha ao enviar e-mail de confirmacao: ${String(err)}`,
        )
      }

      try {
        await fetch(`${base}/api/chats/message/sendWelcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_pagamento',
            userId: responsavelId,
          }),
        })
      } catch (err) {
        await logConciliacaoErro(
          `Falha ao enviar WhatsApp de confirmacao: ${String(err)}`,
        )
      }
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
