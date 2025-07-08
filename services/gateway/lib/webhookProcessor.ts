import createPocketBase from './pocketbase'
import { logConciliacaoErro } from './server/logger'
import { getTenantHost } from './getTenantHost'

export type AsaasWebhookPayload = {
  payment?: {
    id?: string
    accountId?: string
    externalReference?: string
    customer?: string
  }
  event?: string
  accountId?: string
  /** Identificador do cliente (tenant) */
  cliente?: string
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

interface ClienteRecord {
  id: string
  asaas_api_key?: string
  nome?: string
}

interface PedidoRecord {
  id: string
  id_pagamento?: string
  responsavel?: string
  id_inscricao?: string
}

interface InscricaoRecord {
  id: string
  criado_por?: string
}

export async function processWebhook(body: AsaasWebhookPayload) {
  const pb = createPocketBase()
  const baseUrl = process.env.ASAAS_API_URL
  let site: string | undefined

  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

  const payment = body.payment
  const paymentId = payment?.id
  const eventType = body.event

  if (!paymentId) return
  if (eventType !== 'PAYMENT_RECEIVED' && eventType !== 'PAYMENT_CONFIRMED') {
    return
  }

  let clienteApiKey: string | null = null
  let clienteNome: string | undefined
  let usuarioId: string | undefined
  let inscricaoId: string | undefined
  let clienteId: string | undefined = body.cliente

  const accountId = payment.accountId || body.accountId
  if (accountId) {
    try {
      const cliente = await pb
        .collection('m24_clientes')
        .getFirstListItem<ClienteRecord>(`asaas_account_id = "${accountId}"`)
      clienteApiKey = cliente.asaas_api_key ?? null
      clienteNome = cliente.nome
      clienteId = cliente.id
    } catch {
      /* não encontrado */
    }
  }

  if (payment.externalReference) {
    const match = /cliente_([^_]+)_usuario_([^_]+)(?:_inscricao_([^_]+))?/.exec(
      payment.externalReference,
    )
    if (match) {
      usuarioId = match[2]
      inscricaoId = match[3]
      clienteId = match[1]
      if (!clienteApiKey) {
        try {
          const fallback = await pb
            .collection('m24_clientes')
            .getOne<ClienteRecord>(clienteId)
          clienteApiKey = fallback.asaas_api_key ?? null
          clienteNome = fallback.nome
        } catch {
          /* ignore */
        }
      }
    }
  }

  if (!clienteApiKey) {
    await logConciliacaoErro(
      `Cliente não encontrado (accountId: ${accountId ?? 'indefinido'}, externalReference: ${payment.externalReference ?? 'indefinido'})`,
    )
    throw new Error('Cliente não encontrado')
  }

  if (clienteId) {
    try {
      const tenantHost = await getTenantHost(clienteId)
      if (tenantHost) site = tenantHost
    } catch {
      /* ignore */
    }
  }

  const keyHeader = clienteApiKey.startsWith('$')
    ? clienteApiKey
    : `$${clienteApiKey}`

  const paymentRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
    headers: {
      Accept: 'application/json',
      'access-token': keyHeader,
      'User-Agent': clienteNome ?? 'qg3',
    },
  })
  if (!paymentRes.ok) {
    const details = await paymentRes.text()
    throw new Error(`Falha ao obter pagamento: ${details}`)
  }

  const paymentData = (await paymentRes.json()) as AsaasPaymentResponse
  const {
    status,
    externalReference,
    customer: asaasCustomerId,
    value,
  } = paymentData
  if (status !== 'RECEIVED' && status !== 'CONFIRMED') {
    return
  }

  if (externalReference && !inscricaoId) {
    const m = /cliente_[^_]+_usuario_[^_]+_inscricao_([^_]+)/.exec(
      externalReference,
    )
    inscricaoId = m?.[1]
  }

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
    /* nenhum registro inicial */
  }

  if (!pedidoRecord && inscricaoId) {
    try {
      const lista = await pb.collection('pedidos').getList<PedidoRecord>(1, 1, {
        filter: `id_inscricao = "${inscricaoId}"`,
        sort: '-created',
      })
      if (lista.items.length > 0) pedidoRecord = lista.items[0]
    } catch {
      /* ignore */
    }
  }

  if (!pedidoRecord && asaasCustomerId) {
    try {
      const clienteRes = await fetch(
        `${baseUrl}/customers/${asaasCustomerId}`,
        {
          headers: { Accept: 'application/json', 'access-token': keyHeader },
        },
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
          if (pedidos.items.length > 0) pedidoRecord = pedidos.items[0]
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (!pedidoRecord) {
    await logConciliacaoErro(
      `Pedido não encontrado para pagamento ${paymentId}`,
    )
    throw new Error('Pedido não encontrado')
  }

  try {
    await pb
      .collection('pedidos')
      .update(pedidoRecord.id, { status: 'pago', id_pagamento: paymentId })
    if (inscricaoId) {
      await pb
        .collection('inscricoes')
        .update<InscricaoRecord>(inscricaoId, { status: 'confirmado' })
    }

    let responsavelId = pedidoRecord.responsavel
    if (!responsavelId && inscricaoId) {
      try {
        const inscricao = await pb
          .collection('inscricoes')
          .getOne<InscricaoRecord>(inscricaoId)
        responsavelId = inscricao.criado_por
      } catch {
        /* ignore */
      }
    }

    if (responsavelId && site) {
      await fetch(`${site}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'confirmacao_pagamento',
          userId: responsavelId,
          amount: value,
        }),
      })
      await fetch(`${site}/api/chats/message/sendWelcome`, {
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
    throw error
  }
}
