import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { pbRetry } from '@/lib/pbRetry'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro, logSentryEvent } from '@/lib/server/logger'
import type { RecordModel } from 'pocketbase'

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

    const pb = createPocketBase()
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
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
      let inscricao: { id?: string; nome?: string; status?: string } | null = null
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
          logSentryEvent('recuperar_status', {
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
                  `id_inscricao="${inscricao.id}" && (status='pendente' || status='vencido')`,
                  { sort: '-created' },
                ),
            )
          } catch {
            // ignore 404
          }

          if (pedido?.link_pagamento) {
            logSentryEvent('recuperar_link', {
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

        logSentryEvent('recuperar_status', {
          cpf: idempotencyKey,
          status: inscricao.status,
        })
        return NextResponse.json({ status: inscricao.status })
      }

      logSentryEvent('recuperar_inexistente', { cpf: idempotencyKey })
      return NextResponse.json(
        {
          error:
            'Inscrição não encontrada. Crie a inscrição para receber o link.',
        },
        { status: 404 },
      )
    }

    const pedidoId = cobranca.pedido
    const link_pagamento = cobranca.invoiceUrl

    logSentryEvent('recuperar_link', {
      cpf: idempotencyKey,
      pedidoId,
    })

    return NextResponse.json({
      nomeUsuario: cobranca.nomeUsuario,
      link_pagamento,
    })
  } catch (err) {
    console.error('Erro ao recuperar link:', err)
    await logConciliacaoErro('Erro ao recuperar link: ' + String(err))
    return NextResponse.json(
      { error: 'Erro interno ao recuperar link' },
      { status: 500 },
    )
  }
}
