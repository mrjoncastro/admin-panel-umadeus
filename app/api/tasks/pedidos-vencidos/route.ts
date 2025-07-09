import { NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { pbRetry } from '@/lib/pbRetry'
import { queueTextMessage } from '@/lib/server/chats'

export const config = { runtime: 'nodejs' }

export async function GET(): Promise<NextResponse> {
  const pb = createPocketBase()
  if (!pb.authStore.isValid) {
    await pbRetry(() =>
      pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      ),
    )
  }

  const now = new Date().toISOString()
  const pendentes = await pbRetry(() =>
    pb.collection('pedidos').getFullList(200, {
      filter: `status='pendente' && vencimento != '' && vencimento < "${now}"`,
      expand: 'id_inscricao.evento',
    }),
  )

  let mensagens = 0
  for (const pedido of pendentes) {
    await pbRetry(() =>
      pb.collection('pedidos').update(pedido.id, { status: 'vencido' }),
    )

    const telefone = pedido.expand?.id_inscricao?.telefone
    const nome = pedido.expand?.id_inscricao?.nome || ''
    const eventoTitulo = pedido.expand?.id_inscricao?.expand?.evento?.titulo
    const link = pedido.link_pagamento
    const tenant = pedido.cliente

    if (telefone && link && tenant) {
      try {
        const cfg = await pbRetry(() =>
          pb
            .collection('whatsapp_clientes')
            .getFirstListItem(`cliente='${tenant}'`),
        )
        const message =
          `Oi ${nome}! 😃 Garanta já sua vaga no ${eventoTitulo ?? 'evento'} fazendo o pagamento. ` +
          `Dúvidas? Fale com seu líder.\n\nLink:\n${link}`
        await queueTextMessage({
          tenant,
          instanceName: cfg.instanceName,
          apiKey: cfg.apiKey,
          to: telefone,
          message,
        })
        mensagens++
      } catch (err) {
        console.error('[pedidos-vencidos] erro ao enviar WhatsApp', err)
      }
    }
  }

  return NextResponse.json({ atualizados: pendentes.length, mensagens })
}
