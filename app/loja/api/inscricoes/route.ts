import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { ClientResponseError } from 'pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro, logSentryEvent } from '@/lib/server/logger'
import type { PaymentMethod } from '@/lib/asaasFees'
import { criarInscricao, InscricaoTemplate } from '@/lib/templates/inscricao'

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  pb.authStore.loadFromCookie(req.headers.get('cookie') || '')
  const tenantId = await getTenantFromHost()

  try {
    const data = await req.json()

    const nome = `${data.user_first_name || ''} ${
      data.user_last_name || ''
    }`.trim()
    const senha = data.password || data.passwordConfirm

    let usuario = pb.authStore.isValid ? pb.authStore.model : null
    if (!usuario) {
      try {
        usuario = await pb
          .collection('usuarios')
          .getFirstListItem(`email='${data.user_email}'`)
      } catch {
        const cpf = String(data.user_cpf).replace(/\D/g, '')
        const telefone = String(data.user_phone).replace(/\D/g, '')
        try {
          const dup = await pb.collection('usuarios').getList(1, 1, {
            filter: `cpf='${cpf}' || email='${data.user_email}'`,
          })
          if (dup.items.length > 0) {
            return NextResponse.json(
              { error: 'Já existe um usuário com este CPF ou e-mail.' },
              { status: 409 },
            )
          }
        } catch {}
        if (!tenantId) {
          return NextResponse.json(
            { error: 'Tenant não informado' },
            { status: 400 },
          )
        }
        const tempPass = Math.random().toString(36).slice(2, 10)
        usuario = await pb.collection('usuarios').create({
          nome,
          email: data.user_email,
          emailVisibility: true,
          cpf,
          telefone,
          data_nascimento: data.user_birth_date,
          genero: data.user_gender?.toLowerCase(),
          endereco: data.user_address,
          bairro: data.user_neighborhood,
          cep: data.user_cep,
          cidade: data.user_city,
          estado: data.user_state,
          numero: data.user_number,
          cliente: tenantId,
          campo: data.campo,
          perfil: 'usuario',
          role: data.role || 'usuario',
          password: senha || tempPass,
          passwordConfirm: senha || tempPass,
        })
      }
    }
    if (!usuario) {
      throw new Error('Não foi possível identificar o usuário')
    }

    const cpfNumerico = String(data.user_cpf).replace(/\D/g, '')
    const filtroDuplicado = `evento='${data.evento}' && (criado_por='${usuario.id}' || cpf='${cpfNumerico}')`
    try {
      await pb.collection('inscricoes').getFirstListItem(filtroDuplicado)
      return NextResponse.json(
        { error: 'Usuário já inscrito neste evento' },
        { status: 409 },
      )
    } catch {
      // OK - não encontrado
    }

    const baseInscricao: InscricaoTemplate = {
      nome,
      email: data.user_email,
      telefone: String(data.user_phone).replace(/\D/g, ''),
      cpf: String(data.user_cpf).replace(/\D/g, ''),
      data_nascimento: data.user_birth_date,
      genero: data.user_gender.toLowerCase(),
      campo: data.campo,
      evento: data.evento,
      criado_por: usuario.id,
      produto: data.produtoId,
      tamanho: data.tamanho,
      ...(tenantId ? { cliente: tenantId } : {}),
    }

    const paymentMethod: PaymentMethod = ['pix', 'boleto'].includes(
      data.paymentMethod,
    )
      ? data.paymentMethod
      : 'pix'
    const installments = 1

    const { id: _inscricaoId, ...inscricaoSemId } =
      criarInscricao(baseInscricao)
    void _inscricaoId

    const registroParaCriar = {
      ...inscricaoSemId,
      paymentMethod,
      installments,
    }

    const record = await pb.collection('inscricoes').create(registroParaCriar)

    const evento = await pb.collection('eventos').getOne(data.evento)

    console.log('Registro criado com sucesso:', record)
    logSentryEvent('inscricao_loja', {
      inscricaoId: record.id,
      userId: usuario?.id,
    })

    let eventType: 'nova_inscricao' | 'confirmacao_inscricao' =
      'confirmacao_inscricao'

    try {
      if (tenantId) {
        const cfgConfirm = await pb
          .collection('clientes_config')
          .getFirstListItem(`cliente='${tenantId}'`)
        if (cfgConfirm?.confirma_inscricoes === true) {
          eventType = 'nova_inscricao'
        }
      }
    } catch (e) {
      console.error('Erro ao verificar confirma_inscricoes:', e)
    }

    const payload: Record<string, unknown> = {
      eventType,
      userId: usuario.id,
    }

    const base = req.nextUrl?.origin || req.headers.get('origin')
    if (!base) {
      console.error('Base URL não encontrada para envio de notificações')
      return
    }

    let liderId: string | undefined
    try {
      const lider = await pb
        .collection('usuarios')
        .getFirstListItem(`campo='${data.campo}' && role='lider'`)
      liderId = lider.id
    } catch (e) {
      console.error('Líder não encontrado para o campo', e)
    }

    try {
      await fetch(`${base}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.error('Erro ao enviar e-mail de inscrição:', e)
    }

    fetch(`${base}/api/chats/message/sendWelcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.error('Erro ao enviar WhatsApp de inscrição:', e))

    if (liderId) {
      fetch(`${base}/api/chats/message/sendWelcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'confirmacao_pendente_lider',
          userId: liderId,
          inscritoNome: nome,
          eventoTitulo: evento.titulo,
        }),
      }).catch((e) => console.error('Erro ao enviar WhatsApp para o líder:', e))
    }

    return NextResponse.json(record, { status: 201 })
  } catch (err: unknown) {
    console.error('Erro ao criar inscrição:', err)

    let detalhes: unknown = null
    if (err instanceof ClientResponseError) {
      console.error('URL chamada:', err.url)
      console.error('Status HTTP:', err.status)
      console.error(
        'Resposta do PocketBase:',
        JSON.stringify(err.response, null, 2),
      )
      detalhes = err.response
      if (err.originalError) {
        console.error('Erro original:', err.originalError)
      }
    } else if (err && typeof err === 'object') {
      const errorData = err as Record<string, unknown>
      if ('url' in errorData) console.error('URL chamada:', errorData.url)
      if ('status' in errorData) console.error('Status HTTP:', errorData.status)
      if ('response' in errorData) {
        console.error(
          'Resposta do PocketBase:',
          JSON.stringify(errorData.response, null, 2),
        )
        detalhes = errorData.response
      }
      if ('originalError' in errorData) {
        console.error('Erro original:', errorData.originalError)
      }
    }

    await logConciliacaoErro(`Erro ao criar inscrição na loja: ${String(err)}`)
    return NextResponse.json(
      { error: 'Erro ao salvar', detalhes },
      { status: 500 },
    )
  }
}
