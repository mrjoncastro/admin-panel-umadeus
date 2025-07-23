// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
import { requireClienteFromHost } from '@/lib/clienteAuth'
import { logger } from '@/lib/logger'
import { buildExternalReference } from '@/lib/asaas'
import { calculateGross, PaymentMethod } from '@/lib/asaasFees'
import { toAsaasBilling } from '@/lib/paymentMethodMap'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  logger.info('Nova requisição para pagamento Asaas')

  const auth = await requireClienteFromHost(req)
  
  if ('error' in auth) {
    logger.error('Erro de autenticação Asaas', auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { cliente } = auth
  const baseUrl = process.env.ASAAS_API_URL

  const userAgent = cliente.nome || 'M24'
  const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || ''

  if (!apiKey) {
    logger.error('ASAAS_API_KEY não definida')
    throw new Error('ASAAS_API_KEY não definida! Confira configuração.')
  }
  
  logger.debug('API Key configurada', { hasKey: !!apiKey })

  const keyHeader = apiKey.startsWith('$') ? apiKey : '$' + apiKey

  if (!keyHeader || !baseUrl) {
    logger.debug(
      '🔴 [POST /api/asaas] Chave da API Asaas ou URL não configurada',
    )
    return NextResponse.json(
      { error: 'Chave da API Asaas ou URL não configurada' },
      { status: 500 },
    )
  }

  try {
    const {
      pedidoId,
      valorBruto,
      paymentMethod,
      installments = 1,
    } = await req.json()
    logInfo('📦 Dados recebidos:', {
      pedidoId,
      valorBruto,
      paymentMethod,
      installments,
    })
    logger.debug('📦 Dados recebidos:', {
      pedidoId,
      valorBruto,
      paymentMethod,
      installments,
    })

    const normalizedPaymentMethod: PaymentMethod =
      paymentMethod?.toLowerCase() === 'credito' ? 'pix' : paymentMethod

    if (!pedidoId || valorBruto === undefined || valorBruto === null) {
      logger.debug('🔴 [POST /api/asaas] pedidoId e valorBruto são obrigatórios')
      return NextResponse.json(
        { error: 'pedidoId e valorBruto são obrigatórios' },
        { status: 400 },
      )
    }

    const parsedValor = Number(valorBruto)
    if (!isFinite(parsedValor) || parsedValor <= 0) {
      logger.debug('🔴 [POST /api/asaas] Valor deve ser numérico e positivo')
      return NextResponse.json(
        { error: 'Valor deve ser numérico e positivo' },
        { status: 400 },
      )
    }

    if (
      normalizedPaymentMethod !== 'pix' &&
      normalizedPaymentMethod !== 'boleto'
    ) {
      logger.debug(
        '🔴 [POST /api/asaas] Forma de pagamento inválida:',
        normalizedPaymentMethod,
      )
      return NextResponse.json(
        { error: 'Forma de pagamento inválida' },
        { status: 400 },
      )
    }

    if (!// pb. // [REMOVED] authStore.isValid) {
      logger.debug('🟡 [POST /api/asaas] Autenticando admin PocketBase...')
      await // pb. // [REMOVED] admins.authWithPassword(
        process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
        process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
      )
    }

    // Buscar pedido
    const pedido = await // pb. // [REMOVED] collection('pedidos').getOne(pedidoId)
    logger.debug('📦 Pedido encontrado:', pedido)
    if (!pedido) {
      logger.debug('🔴 [POST /api/asaas] Pedido não encontrado')
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 },
      )
    }

    // Buscar inscrição vinculada
    const inscricao = await pb
      .collection('inscricoes')
      .getOne(pedido.id_inscricao)
    logger.debug('📦 Inscrição encontrada:', inscricao)
    if (!inscricao) {
      logger.debug(
        '🔴 [POST /api/asaas] Inscrição associada ao pedido não encontrada',
      )
      return NextResponse.json(
        { error: 'Inscrição associada ao pedido não encontrada' },
        { status: 404 },
      )
    }

    const cpfCnpj = inscricao.cpf.replace(/\D/g, '')
    logger.debug('🟢 [POST /api/asaas] CPF/CNPJ processado:', cpfCnpj)

    // 🔹 Verificar se cliente já existe no Asaas pelo CPF
    const buscaCliente = await fetch(
      `${baseUrl}/customers?cpfCnpj=${cpfCnpj}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'access-token': keyHeader,
          'User-Agent': userAgent,
        },
      },
    )
    logger.debug('📤 [POST /api/asaas] Request buscar cliente enviada')

    let clienteId: string | null = null
    if (buscaCliente.ok) {
      const data = await buscaCliente.json()
      logger.debug('📥 [POST /api/asaas] Resposta buscar cliente:', data)
      if (Array.isArray(data.data) && data.data.length > 0) {
        clienteId = data.data[0].id // Usa o primeiro cliente encontrado
        logInfo('👤 Cliente já existe no Asaas: ' + clienteId)
        logger.debug('👤 Cliente já existe no Asaas:', clienteId)
      }
    } else {
      logger.debug(
        '🔴 [POST /api/asaas] Falha ao buscar cliente no Asaas:',
        buscaCliente.status,
      )
    }

    // 🔹 Se não existe, cria o cliente
    if (!clienteId) {
      const clientePayload = {
        name: inscricao.nome,
        email: inscricao.email,
        cpfCnpj,
        phone: inscricao.telefone || '71900000000',
        address: inscricao.endereco || 'Endereço padrão',
        addressNumber: inscricao.numero || '02',
        province: 'BA',
        postalCode: '41770055',
      }

      logInfo('➡️ Payload enviado para criar cliente no Asaas:', clientePayload)
      logger.debug(
        '➡️ Payload enviado para criar cliente no Asaas:',
        clientePayload,
      )

      const clienteResponse = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'access-token': keyHeader,
          'User-Agent': userAgent,
        },
        body: JSON.stringify(clientePayload),
      })

      const raw = await clienteResponse.text()
      logInfo('⬅️ Resposta recebida do Asaas (cliente):', raw)
      logger.debug('⬅️ Resposta recebida do Asaas (cliente):', raw)

      if (!clienteResponse.ok) {
        await logConciliacaoErro(
          `Erro ao criar cliente: status ${clienteResponse.status} | ${raw}`,
        )
        logger.debug('🔴 [POST /api/asaas] Erro ao criar cliente:', raw)
        throw new Error('Erro ao criar cliente')
      }

      const cliente = JSON.parse(raw)
      clienteId = cliente.id
      logInfo('✅ Cliente criado: ' + clienteId)
      logger.debug('✅ Cliente criado:', clienteId)
    }

    // 🔹 Criar cobrança
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    const clienteTenantId =
      ((pedido as Record<string, unknown>).cliente as string | undefined) ||
      ((inscricao as Record<string, unknown>).cliente as string | undefined) ||
      ((inscricao as Record<string, unknown>).campo as string | undefined)
    const usuarioIdRef =
      (pedido.responsavel as string | undefined) ||
      (inscricao.criado_por as string | undefined)
    const externalReference = buildExternalReference(
      String(clienteTenantId),
      String(usuarioIdRef),
      inscricao.id,
    )
    logInfo('🔧 Chamando createCheckout com:', {
      pedido,
      externalReference,
    })
    logger.debug('🔧 Chamando createCheckout com:', {
      pedido,
      externalReference,
    })

    // Payload de pagamento
    const { gross, margin } = calculateGross(
      parsedValor,
      normalizedPaymentMethod as PaymentMethod,
      installments,
    )
    logger.debug('💰 gross:', gross, 'margin:', margin)

    const billingType = toAsaasBilling(normalizedPaymentMethod as PaymentMethod)
    if (!['PIX', 'BOLETO'].includes(billingType)) {
      logger.debug(
        '🔴 [POST /api/asaas] Forma de pagamento inválida:',
        billingType,
      )
      return NextResponse.json(
        { error: 'Forma de pagamento inválida' },
        { status: 400 },
      )
    }

    const paymentPayload = {
      customer: clienteId,
      billingType,
      value: gross,
      dueDate: dueDateStr,
      description: Array.isArray(pedido.produto)
        ? pedido.produto.join(', ')
        : pedido.produto || 'Produto',
      split: [
        {
          walletId: process.env.WALLETID_M24,
          fixedValue: margin,
        },
      ],
      externalReference,
    }

    logInfo('➡️ Payload enviado para criar cobrança no Asaas:', paymentPayload)
    logger.debug(
      '➡️ Payload enviado para criar cobrança no Asaas:',
      paymentPayload,
    )

    const cobrancaResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-token': keyHeader,
        'User-Agent': userAgent,
      },
      body: JSON.stringify(paymentPayload),
    })

    // Log da resposta do Asaas (pagamento)
    const cobrancaRaw = await cobrancaResponse.clone().text()
    logInfo('⬅️ Resposta recebida do Asaas (cobrança):', cobrancaRaw)
    logger.debug('⬅️ Resposta recebida do Asaas (cobrança):', cobrancaRaw)

    if (!cobrancaResponse.ok) {
      await logConciliacaoErro(
        `Erro ao criar cobrança: status ${cobrancaResponse.status} | ${cobrancaRaw}`,
      )
      logger.debug('🔴 [POST /api/asaas] Erro ao criar cobrança:', cobrancaRaw)
      throw new Error('Erro ao criar cobrança')
    }

    const cobranca = JSON.parse(cobrancaRaw)
    const link = cobranca.invoiceUrl || cobranca.bankSlipUrl
    const asaasId: string | undefined = cobranca.id
    const dueDateISO = cobranca.dueDate
      ? new Date(cobranca.dueDate).toISOString()
      : new Date(dueDate).toISOString()
    logInfo('✅ Cobrança criada. Link: ' + link)
    logger.debug('✅ Cobrança criada. Link:', link)

    // 🔹 Atualizar pedido
    const taxaAplicada = Number((gross - parsedValor - margin).toFixed(2))
    await // pb. // [REMOVED] collection('pedidos').update(pedido.id, {
      link_pagamento: link,
      valorBrutoDesejado: parsedValor,
      valorBruto: gross,
      taxaAplicada,
      margemPlataforma: margin,
      formaPagamento: normalizedPaymentMethod,
      parcelas: installments,
      vencimento: dueDateISO,
      ...(asaasId ? { id_asaas: asaasId } : {}),
    })
    logger.debug('🟢 Pedido atualizado com link de pagamento')

    return NextResponse.json({
      url: link,
      vencimento: dueDateISO,
      id_asaas: asaasId,
    })
  } catch (err: unknown) {
    await logConciliacaoErro(
      `Erro ao gerar link de pagamento Asaas: ${String(err)}`,
    )
    logger.debug('🔴 [POST /api/asaas] Erro ao gerar link de pagamento:', err)
    return NextResponse.json(
      { error: 'Erro ao gerar link de pagamento' },
      { status: 500 },
    )
  }
}
