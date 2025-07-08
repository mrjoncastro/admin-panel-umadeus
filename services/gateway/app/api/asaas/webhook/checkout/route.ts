// ./app/api/asaas/webhook/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'

type AsaasCheckoutWebhook = {
  event?: string
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
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  const rawBody = await req.text()
  let body: AsaasCheckoutWebhook

  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Garantir autenticação do PB antes de qualquer operação
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    )
  }

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
      } catch (err: unknown) {
        // Tratamento de erro sem any
        let detalhes: unknown = null
        let message = 'Erro desconhecido'
        if (typeof err === 'object' && err !== null && 'data' in err) {
          detalhes = (err as { data?: unknown }).data
        }
        if (err instanceof Error) {
          message = err.message
        } else if (typeof err === 'string') {
          message = err
        }

        await logConciliacaoErro(
          `Falha ao atualizar pedido ${pedidoId}: ${message} | ${JSON.stringify(detalhes)}`,
        )
        return NextResponse.json(
          {
            error: 'Erro ao atualizar pedido',
            detalhes: message,
            dados: detalhes,
          },
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

  return NextResponse.json({ status: 'Evento não tratado' })
}
