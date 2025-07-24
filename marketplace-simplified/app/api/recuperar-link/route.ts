// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { pbRetry } from '@/lib/pbRetry'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro, logRocketEvent } from '@/lib/server/logger'
// [REMOVED] PocketBase import

interface CobrancaRecord extends RecordModel {
  status?: string
  dueDate?: string
  invoiceUrl?: string
  pedido?: string
  nomeUsuario?: string
}

export async function POST(req: NextRequest) {
  try {
    const { cpf } = await req.json()
    const idempotencyKey = String(cpf ?? '').replace(/\D/g, '')

    if (idempotencyKey.length !== 11) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }

    // const pb = createPocketBase() // [REMOVED]
    if (!// pb. // [REMOVED] authStore.isValid) {
      await // pb. // [REMOVED] admins.authWithPassword(
        process.env.// PB_ADMIN_EMAIL // [REMOVED]!,
        process.env.// PB_ADMIN_PASSWORD // [REMOVED]!,
      )
    }

    let cobranca: CobrancaRecord | null = null
    try {
      cobranca = await pbRetry(() =>
        pb
          .collection('cobrancas')
          .getFirstListItem(`idempotencyKey="${idempotencyKey}"`, {
            sort: '-created',
            expand: 'pedido',
          }),
      )
    } catch {
      // quando não existe, PocketBase lança erro 404
    }

    if (!cobranca) {
      const tenantId = await getTenantFromHost()
      let inscricao: { id?: string;import { logger } from '@/lib/logger'
 nome?: string; status?: string } | null =
        null
      if (tenantId) {
        try {
          inscricao = await pbRetry(() =>
            pb
              .collection('inscricoes')
              .getFirstListItem(
                `cpf="${idempotencyKey}" && cliente="${tenantId}"`,
              ),
          )
        } catch {
          // ignore 404
        }
      }

      if (inscricao) {
        if (inscricao.status === 'pendente') {
          logRocketEvent('recuperar_status', {
            cpf: idempotencyKey,
            status: 'pendente',
          })
          return NextResponse.json({
            status: 'pendente',
            mensagem: 'Inscrição aguardando aprovação da liderança.',
          })
        }

        if (inscricao.status === 'aguardando_pagamento' && inscricao.id) {
          let pedido: { id?: string; link_pagamento?: string } | null = null
          try {
            pedido = await pbRetry(() =>
              pb
                .collection('pedidos')
                .getFirstListItem(
                  `id_inscricao="${inscricao.id}" && status='pendente'`,
                  { sort: '-created' },
                ),
            )
          } catch {
            // ignore 404
          }
          if (pedido?.link_pagamento) {
            logRocketEvent('recuperar_link', {
              cpf: idempotencyKey,
              pedidoId: pedido.id,
              via: 'pedido',
            })
            return NextResponse.json({
              nomeUsuario: inscricao.nome,
              link_pagamento: pedido.link_pagamento,
            })
          }
        }

        logRocketEvent('recuperar_status', {
          cpf: idempotencyKey,
          status: inscricao.status,
        })
        return NextResponse.json({ status: inscricao.status })
      }

      logRocketEvent('recuperar_inexistente', { cpf: idempotencyKey })
      return NextResponse.json(
        {
          error:
            'Inscrição não encontrada. Crie a inscrição para receber o link.',
        },
        { status: 404 },
      )
    }

    const pedidoId = cobranca.pedido
    const vencida =
      (cobranca.status !== 'PENDING' && cobranca.status !== 'UNPAID') ||
      (cobranca.dueDate
        ? new Date(cobranca.dueDate).getTime() < Date.now()
        : true)

    let link_pagamento = cobranca.invoiceUrl

    if (vencida) {
      const base = req.nextUrl.origin
      const resp = await fetch(
        `${base}/api/pedidos/${pedidoId}/nova-cobranca`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idempotencyKey }),
        },
      )

      if (!resp.ok) {
        return NextResponse.json(
          { error: 'Erro ao criar nova cobrança' },
          { status: 500 },
        )
      }

      const nova = await resp.json()
      link_pagamento = nova.link_pagamento
    }
    logRocketEvent('recuperar_link', {
      cpf: idempotencyKey,
      pedidoId,
      nova: vencida,
    })

    return NextResponse.json({
      nomeUsuario: cobranca.nomeUsuario,
      link_pagamento,
    })
  } catch (err) {
    logger.error('Erro ao recuperar link:', err)
    await logConciliacaoErro('Erro ao recuperar link: ' + String(err))
    return NextResponse.json(
      { error: 'Erro interno ao recuperar link' },
      { status: 500 },
    )
  }
}
