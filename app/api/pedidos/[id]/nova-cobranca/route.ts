import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Pedido } from '@/types'
import { buildExternalReference } from '@/lib/asaas'
import { calculateGross, PaymentMethod } from '@/lib/asaasFees'
import { toAsaasBilling } from '@/lib/paymentMethodMap'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { RecordModel } from 'pocketbase'

async function checkAccess(pedido: Pedido, user: RecordModel) {
  if (user.role === 'usuario') {
    if (pedido.responsavel !== user.id) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else if (user.role === 'lider') {
    if (pedido.campo !== user.campo) {
      return { error: 'Acesso negado', status: 403 }
    }
  } else {
    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return { error: 'Tenant não informado', status: 400 }
    }
    if (pedido.cliente !== tenantId) {
      return { error: 'Acesso negado', status: 403 }
    }
  }
  return { ok: true }
}

export async function POST(req: NextRequest) {
  const segments = req.nextUrl.pathname.split('/')
  const id = segments[segments.length - 2]
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth

  try {
    const pedido = await pb.collection('pedidos').getOne<Pedido>(id)
    const access = await checkAccess(pedido, user)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    if (
      pedido.status !== 'pendente' ||
      !pedido.vencimento ||
      new Date(pedido.vencimento) > new Date()
    ) {
      return NextResponse.json(
        { error: 'Cobrança ainda válida ou pedido não pendente' },
        { status: 400 },
      )
    }

    const inscricao = await pb
      .collection('inscricoes')
      .getOne(pedido.id_inscricao)

    const cpfCnpj = inscricao.cpf.replace(/\D/g, '')
    const baseUrl = process.env.ASAAS_API_URL
    const apiKey = inscricao.cliente
      ? (await pb.collection('clientes').getOne(inscricao.cliente)).asaas_api_key
      : process.env.ASAAS_API_KEY
    const userAgent = inscricao.nome || 'umadeus'
    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'Asaas não configurado' },
        { status: 500 },
      )
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    let clienteId: string | null = null
    const buscaCliente = await fetch(`${baseUrl}/customers?cpfCnpj=${cpfCnpj}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'access-token': apiKey.startsWith('$') ? apiKey : `$${apiKey}`,
        'User-Agent': userAgent,
      },
    })
    if (buscaCliente.ok) {
      const data = await buscaCliente.json()
      if (Array.isArray(data.data) && data.data.length > 0) {
        clienteId = data.data[0].id
      }
    }

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
      const resp = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'access-token': apiKey.startsWith('$') ? apiKey : `$${apiKey}`,
          'User-Agent': userAgent,
        },
        body: JSON.stringify(clientePayload),
      })
      const raw = await resp.text()
      if (!resp.ok) {
        await logConciliacaoErro(`Erro ao criar cliente: ${raw}`)
        return NextResponse.json(
          { error: 'Erro ao criar cliente' },
          { status: 500 },
        )
      }
      const json = JSON.parse(raw)
      clienteId = json.id
    }

    const due = new Date()
    due.setDate(due.getDate() + 3)
    const defaultDue = due.toISOString().split('T')[0]

    const externalReference = buildExternalReference(
      String(pedido.cliente || inscricao.cliente),
      String(pedido.responsavel || inscricao.criado_por),
      inscricao.id,
    )

    const { gross, margin } = calculateGross(
      Number(pedido.valor),
      'pix' as PaymentMethod,
      1,
    )
    const billingType = toAsaasBilling('pix' as PaymentMethod)

    const paymentPayload = {
      customer: clienteId,
      billingType,
      value: gross,
      dueDate: defaultDue,
      description: Array.isArray(pedido.produto)
        ? pedido.produto.join(', ')
        : pedido.produto[0] || 'Produto',
      split: [
        { walletId: process.env.WALLETID_M24, fixedValue: margin },
      ],
      externalReference,
    }

    const cobrancaResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-token': apiKey.startsWith('$') ? apiKey : `$${apiKey}`,
        'User-Agent': userAgent,
      },
      body: JSON.stringify(paymentPayload),
    })
    const cobrancaRaw = await cobrancaResponse.text()
    if (!cobrancaResponse.ok) {
      await logConciliacaoErro(
        `Erro ao criar cobrança: status ${cobrancaResponse.status} | ${cobrancaRaw}`,
      )
      return NextResponse.json(
        { error: 'Erro ao criar cobrança' },
        { status: 500 },
      )
    }
    const cobranca = JSON.parse(cobrancaRaw)
    const link = cobranca.invoiceUrl || cobranca.bankSlipUrl
    const dueDateStr = cobranca.dueDate
      ? new Date(cobranca.dueDate).toISOString()
      : new Date(defaultDue).toISOString()
    await pb.collection('pedidos').update(pedido.id, {
      link_pagamento: link,
      vencimento: dueDateStr,
    })
    return NextResponse.json({ link_pagamento: link, vencimento: dueDateStr })
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar nova cobrança: ${String(err)}`)
    return NextResponse.json(
      { error: 'Erro ao gerar nova cobrança' },
      { status: 500 },
    )
  }
}
