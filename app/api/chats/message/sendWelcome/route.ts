import { NextRequest, NextResponse } from 'next/server'
import { queueTextMessage } from '@/lib/server/chats'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export type Body = {
  eventType:
    | 'nova_inscricao'
    | 'confirmacao_inscricao'
    | 'novo_usuario'
    | 'confirmacao_pagamento'
    | 'promocao_lider'
    | 'confirmacao_pendente_lider'
  userId: string
  paymentLink?: string
  campoNome?: string
  inscritoNome?: string
  eventoTitulo?: string
}

export async function POST(req: NextRequest) {
  const pb = createPocketBase()

  try {
    const {
      eventType,
      userId,
      paymentLink,
      campoNome,
      inscritoNome,
      eventoTitulo,
    } = (await req.json()) as Body
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

    const user = await pb
      .collection('usuarios')
      .getOne(userId, { expand: 'campo' })
    const campoNomeFinal =
      campoNome ?? (user.expand?.campo?.nome as string | undefined)
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
    switch (eventType) {
      case 'nova_inscricao':
        message = `Olá ${nome}! Recebemos sua inscrição. Em breve entraremos em contato.`
        break
      case 'confirmacao_inscricao':
        message = `Parabéns, ${nome}!\nSua inscrição foi confirmada com sucesso.\nEstamos empolgados em tê-lo conosco!`
        if (paymentLink) {
          message += `\nClique no botão abaixo para concluir o pagamento:\n${paymentLink}`
        }
        break
      case 'novo_usuario':
        message = `Olá ${nome}! Seu cadastro foi realizado com sucesso.`
        break
      case 'confirmacao_pagamento':
        message = `Olá ${nome}, recebemos seu pagamento. Obrigado!`
        break
      case 'promocao_lider':
        message = `Parabéns, ${nome}! Agora você lidera o campo ${campoNomeFinal}.`
        break
      case 'confirmacao_pendente_lider':
        message = `Olá ${nome}! Recebemos a inscrição de ${inscritoNome} para o evento ${eventoTitulo}. Por favor, confirme no painel administrativo se está tudo certo ou entre em contato caso haja alguma dúvida.`
        break
      default:
        message = ''
    }

    queueTextMessage({
      tenant: tenantId,
      instanceName: waCfg.instanceName,
      apiKey: waCfg.apiKey,
      to: telefone,
      message,
      awaitSend: false,
    })

    return NextResponse.json({ message: 'mensagem enfileirada' }, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
