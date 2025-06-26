import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export type Body = {
  eventType: 'nova_inscricao' | 'confirmacao_inscricao'
  userId: string
  paymentLink?: string
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()

  try {
    const { eventType, userId, paymentLink } = (await req.json()) as Body
    if (!eventType || !userId) {
      return NextResponse.json(
        { error: 'Parâmetros faltando' },
        { status: 400 },
      )
    }

    const tenantId = await getTenantFromHost()
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant inválido' }, { status: 400 })
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!,
      )
    }

    const waCfg = await pb
      .collection('whatsapp_clientes')
      .getFirstListItem(`cliente='${tenantId}'`)
    if (!waCfg) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 },
      )
    }

    const user = await pb.collection('usuarios').getOne(userId)
    const telefone = (user as { telefone?: string }).telefone
    const nome =
      (user as { nome?: string; name?: string }).nome ||
      (user as { name?: string }).name ||
      ''
    if (!telefone) {
      return NextResponse.json(
        { error: 'Usuário sem telefone' },
        { status: 400 },
      )
    }

    let message: string
    if (eventType === 'nova_inscricao') {
      message = `Olá ${nome}! Recebemos sua inscrição. Em breve entraremos em contato.`
    } else {
      message = `Parabéns, ${nome}! Sua inscrição foi confirmada.`
      if (paymentLink) {
        message += ` Realize o pagamento em: ${paymentLink}`
      }
    }

    const result = await sendTextMessage({
      instanceName: waCfg.instanceName,
      apiKey: waCfg.apiKey,
      to: telefone,
      message,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
