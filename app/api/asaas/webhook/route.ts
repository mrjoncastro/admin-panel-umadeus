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

  // Lê e valida corpo da requisição
  const rawBody = await req.text()
  let body: AsaasWebhookPayload
  try {
    body = JSON.parse(rawBody)
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

  const { payment } = body
  const paymentId = payment?.id
  const event = body.event

  // Ignora se não for evento de pagamento válido
  if (!paymentId) {
    return NextResponse.json({ status: 'Ignorado' })
  }
  if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ status: 'Ignorado' })
  }

  // Busca credenciais do cliente na coleção "m24_clientes"
  let clienteApiKey: string | null = null
  let clienteId: string | null = null
  let clienteNome: string | null = null
  let usuarioId: string | null = null
  let inscricaoId: string | null = null

  const accountId = payment.accountId || body.accountId
  if (accountId) {
    try {
      const cliente = await pb
        .collection('m24_clientes')
        .getFirstListItem(`asaas_account_id = "${accountId}"`)
      clienteApiKey = (cliente as any).asaas_api_key ?? null
      clienteId = cliente.id
      clienteNome = (cliente as any).nome ?? null
    } catch {
      // não encontrado
    }
  }

  // Extrai informações de referência externa
  if (payment.externalReference) {
    const match = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      payment.externalReference,
    )
    if (match) {
      clienteId = clienteId || match[1]
      usuarioId = match[2]
      inscricaoId = match[3] ?? null
    }
  }

  if (!clienteApiKey) {
    await logConciliacaoErro(
      `Cliente não encontrado (accountId: ${accountId ?? 'indefinido'}, externalReference: ${payment?.externalReference ?? 'indefinido'})`,
    )
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 },
    )
  }

  logConciliacaoErro(`Webhook recebido com API Key: ${clienteApiKey}`)

  // Prepara cabeçalho de autenticação para Asaas
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

  const paymentData = (await paymentRes.json()) as any
  const status = paymentData.status as string
  const externalRef = paymentData.externalReference as string | undefined
  const asaasCustomerId = paymentData.customer as string | undefined

  // Ignora se não confirmado ou recebido
  if (status !== 'RECEIVED' && status !== 'CONFIRMED') {
    return NextResponse.json({ status: 'Aguardando pagamento' })
  }

  // Extrai inscricaoId de externalReference, se não obtido antes
  if (externalRef && !inscricaoId) {
    const m = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      externalRef,
    )
    if (m) {
      inscricaoId = m[3] ?? null
    }
  }

  // Busca registro de pedido no PocketBase
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
    // ainda sem registro
  }

  // Se não encontrou, tenta via cpf do customer no Asaas
  if (!pedidoRecord && asaasCustomerId) {
    try {
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
        const clienteData = (await clienteRes.json()) as any
        const cpf = clienteData.cpfCnpj?.replace(/\D/g, '')
        if (cpf) {
          const pedidos = await pb
            .collection('pedidos')
            .getList(1, 1, { filter: `cpf = "${cpf}"`, sort: '-created' })
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
      `Pedido nao encontrado para pagamento ${paymentId}`,
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
      await pb.collection('inscricoes').update(inscricaoId, {
        status: 'confirmado',
      })
    }

    // Identifica responsável para notificações
    let responsavelId = (pedidoRecord as any).responsavel as string | undefined
    if (!responsavelId && inscricaoId) {
      try {
        const inscricao = (await pb
          .collection('inscricoes')
          .getOne(inscricaoId)) as any
        responsavelId = inscricao.criado_por as string
      } catch {
        // ignore
      }
    }

    if (responsavelId) {
      const base = req.nextUrl?.origin || req.headers.get('origin')
      if (!base) {
        console.error('Base URL não encontrada para envio de notificações')
        return NextResponse.json(
          { error: 'Base URL não encontrada' },
          { status: 500 },
        )
      }

      // Envia e-mail de confirmação
      try {
        await fetch(`${base}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_pagamento',
            userId: responsavelId,
            amount: paymentData.value,
          }),
        })
      } catch (err: any) {
        await logConciliacaoErro(
          `Falha ao enviar e-mail de confirmacao: ${String(err)}`,
        )
      }

      // Envia WhatsApp de confirmação
      try {
        await fetch(`${base}/api/chats/message/sendWelcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'confirmacao_pagamento',
            userId: responsavelId,
          }),
        })
      } catch (err: any) {
        await logConciliacaoErro(
          `Falha ao enviar WhatsApp de confirmacao: ${String(err)}`,
        )
      }
    }
  } catch (err: any) {
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
