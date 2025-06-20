import { NextRequest, NextResponse } from 'next/server'
import { requireClienteFromHost } from '@/lib/clienteAuth'
import { logInfo } from '@/lib/logger'
import { buildExternalReference } from '@/lib/asaas'
import { calculateGross, PaymentMethod } from '@/lib/asaasFees'
import { toAsaasBilling } from '@/lib/paymentMethodMap'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function POST(req: NextRequest) {
  const auth = await requireClienteFromHost(req)

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, cliente } = auth
  const baseUrl = process.env.ASAAS_API_URL

  const userAgent = cliente.nome || 'qg3'
  const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || ''

  if (!apiKey) {
    throw new Error(
      '❌ ASAAS_API_KEY não definida! Confira seu .env ou painel de variáveis.',
    )
  }
  logInfo('🔑 API Key utilizada:', apiKey)

  const keyHeader = apiKey.startsWith('$') ? apiKey : '$' + apiKey

  if (!keyHeader || !baseUrl) {
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

    if (!pedidoId || valorBruto === undefined || valorBruto === null) {
      return NextResponse.json(
        { error: 'pedidoId e valorBruto são obrigatórios' },
        { status: 400 },
      )
    }

    const parsedValor = Number(valorBruto)
    if (!isFinite(parsedValor) || parsedValor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser numérico e positivo' },
        { status: 400 },
      )
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    // Buscar pedido
    const pedido = await pb.collection('pedidos').getOne(pedidoId)
    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 },
      )
    }

    // Buscar inscrição vinculada
    const inscricao = await pb
      .collection('inscricoes')
      .getOne(pedido.id_inscricao)
    if (!inscricao) {
      return NextResponse.json(
        { error: 'Inscrição associada ao pedido não encontrada' },
        { status: 404 },
      )
    }

    const cpfCnpj = inscricao.cpf.replace(/\D/g, '')

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

    let clienteId: string | null = null
    if (buscaCliente.ok) {
      const data = await buscaCliente.json()
      // Se já existe, retorna sempre um array/data (pode ser vazio)
      if (Array.isArray(data.data) && data.data.length > 0) {
        clienteId = data.data[0].id // Usa o primeiro cliente encontrado
        logInfo('👤 Cliente já existe no Asaas: ' + clienteId)
      }
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

      // LOG do payload enviado para o Asaas (criação do cliente)
      logInfo('➡️ Payload enviado para criar cliente no Asaas:', clientePayload)

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

      // Log da resposta do Asaas (criação do cliente)
      logInfo('⬅️ Resposta recebida do Asaas (cliente):', raw)

      if (!clienteResponse.ok) {
        await logConciliacaoErro(
          `Erro ao criar cliente: status ${clienteResponse.status} | ${raw}`,
        )
        throw new Error('Erro ao criar cliente')
      }

      const cliente = JSON.parse(raw)
      clienteId = cliente.id
      logInfo('✅ Cliente criado: ' + clienteId)
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

    // Payload de pagamento
    const { gross, margin } = calculateGross(
      parsedValor,
      paymentMethod as PaymentMethod,
      installments,
    )

    const billingType = toAsaasBilling(paymentMethod as PaymentMethod)
    if (!['PIX', 'BOLETO', 'CREDIT_CARD'].includes(billingType)) {
      return NextResponse.json(
        { error: 'Forma de pagamento invalida' },
        { status: 400 },
      )
    }

    const paymentPayload = {
      customer: clienteId,
      billingType,
      value: gross,
      dueDate: dueDateStr,
      description: pedido.produto || 'Produto',
      split: [
        {
          walletId: process.env.WALLETID_M24,
          fixedValue: margin,
        },
      ],
      externalReference,
    }

    // LOG do payload enviado para criar cobrança no Asaas
    logInfo('➡️ Payload enviado para criar cobrança no Asaas:', paymentPayload)

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

    if (!cobrancaResponse.ok) {
      await logConciliacaoErro(
        `Erro ao criar cobrança: status ${cobrancaResponse.status} | ${cobrancaRaw}`,
      )
      throw new Error('Erro ao criar cobrança')
    }

    const cobranca = JSON.parse(cobrancaRaw)
    const link = cobranca.invoiceUrl || cobranca.bankSlipUrl
    logInfo('✅ Cobrança criada. Link: ' + link)

    // 🔹 Atualizar pedido
    const taxaAplicada = Number((gross - parsedValor - margin).toFixed(2))
    await pb.collection('pedidos').update(pedido.id, {
      link_pagamento: link,
      valorBrutoDesejado: parsedValor,
      valorBruto: gross,
      taxaAplicada,
      margemPlataforma: margin,
      formaPagamento: paymentMethod,
      parcelas: installments,
    })

    return NextResponse.json({ url: link })
  } catch (err: unknown) {
    await logConciliacaoErro(
      `Erro ao gerar link de pagamento Asaas: ${String(err)}`,
    )
    return NextResponse.json(
      { error: 'Erro ao gerar link de pagamento' },
      { status: 500 },
    )
  }
}
