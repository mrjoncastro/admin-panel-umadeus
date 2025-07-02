import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { createPocketBase } from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { logConciliacaoErro, logRocketEvent } from '@/lib/server/logger'
import type { PaymentMethod } from '@/lib/asaasFees'
import { criarInscricao, InscricaoTemplate } from '@/lib/templates/inscricao'
import type { Inscricao } from '@/types'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['usuario', 'lider', 'coordenador'])
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  const page = Number(req.nextUrl.searchParams.get('page') || '1')
  const perPage = Number(req.nextUrl.searchParams.get('perPage') || '50')
  const status = req.nextUrl.searchParams.get('status') || ''
  try {
    let baseFilter = ''
    if (user.role === 'usuario') {
      baseFilter = `criado_por = "${user.id}"`
    } else if (user.role === 'lider') {
      baseFilter = `campo = "${user.campo}"`
    } else {
      const tenantId = await getTenantFromHost()
      if (!tenantId) {
        return NextResponse.json(
          { error: 'Tenant não informado' },
          { status: 400 },
        )
      }
      baseFilter = `cliente = "${tenantId}"`
    }
    const filtro = status ? `${baseFilter} && status='${status}'` : baseFilter
    const result = await pb.collection('inscricoes').getList(page, perPage, {
      filter: filtro,
      expand: 'evento,campo,pedido,produto',
      sort: '-created',
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error('Erro ao listar inscricoes:', err)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const body = await req.json()
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      tamanho,
      produtoId,
      genero,
      paymentMethod = 'pix' as PaymentMethod,
      installments = 1,
      liderId,
      eventoId,
      evento: eventoBody,
    } = body

    const produtoIdFinal: string | undefined = produtoId || produtoId

    // Limpa CPF e telefone
    const cpfNumerico = cpf.replace(/\D/g, '')
    const telefoneNumerico = telefone.replace(/\D/g, '')

    // Validação de campos obrigatórios
    const eventoIdFinal: string | undefined = eventoId || eventoBody

    const camposObrigatorios = [
      nome,
      email,
      telefoneNumerico,
      cpfNumerico,
      data_nascimento,
      genero,
      liderId,
      eventoIdFinal,
    ]

    if (camposObrigatorios.some((campo) => !campo || campo.trim() === '')) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios.' },
        { status: 400 },
      )
    }

    if (!['masculino', 'feminino'].includes(genero.toLowerCase())) {
      return NextResponse.json(
        { erro: "Gênero inválido. Use 'masculino' ou 'feminino'." },
        { status: 400 },
      )
    }

    if (!['pix', 'boleto', 'credito'].includes(paymentMethod)) {
      return NextResponse.json(
        { erro: 'Forma de pagamento inválida.' },
        { status: 400 },
      )
    }

    if (installments < 1) {
      return NextResponse.json(
        { erro: 'Número de parcelas inválido.' },
        { status: 400 },
      )
    }

    const lider = await pb.collection('usuarios').getOne(liderId, {
      expand: 'campo',
    })

    const campoId = lider.expand?.campo?.id

    if (!campoId) {
      return NextResponse.json(
        { erro: 'Campo do líder não encontrado.' },
        { status: 404 },
      )
    }

    // Verifica duplicidade por telefone ou CPF
    try {
      await pb
        .collection('inscricoes')
        .getFirstListItem(
          `telefone="${telefoneNumerico}" || cpf="${cpfNumerico}"`,
        )
      return NextResponse.json(
        {
          erro: 'Telefone ou CPF já cadastrado. Acesse /admin/inscricoes/recuperar para obter o link.',
        },
        { status: 409 },
      )
    } catch {
      // OK - não encontrado
    }

    // Busca usuário existente ou cria um novo
    let usuario
    try {
      usuario = await pb
        .collection('usuarios')
        .getFirstListItem(`email='${email}' && cliente='${lider.cliente}'`)
    } catch {
      const tempPass = Math.random().toString(36).slice(2, 10)
      usuario = await pb.collection('usuarios').create({
        nome,
        email,
        emailVisibility: true,
        telefone: telefoneNumerico,
        cpf: cpfNumerico,
        data_nascimento,
        cliente: lider.cliente,
        campo: campoId,
        perfil: 'usuario',
        password: tempPass,
        passwordConfirm: tempPass,
      })
    }

    // Cria inscrição SEM pedido
    const dadosBase: InscricaoTemplate = {
      nome,
      email,
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      data_nascimento,
      genero,
      evento: eventoIdFinal!,
      campo: campoId,
      criado_por: usuario.id,
      produto: produtoIdFinal,
      tamanho,
      cliente: lider.cliente,
    }
    const { id: _inscricaoId, ...dadosBaseSemId } = criarInscricao(dadosBase)
    void _inscricaoId

    const dadosInscricao: Omit<Inscricao, 'id'> & {
      paymentMethod: PaymentMethod
      installments: number
    } = {
      ...dadosBaseSemId,
      paymentMethod,
      installments,
    }

    const inscricao = await pb.collection('inscricoes').create(dadosInscricao)
    logRocketEvent('nova_inscricao_admin', {
      inscricaoId: inscricao.id,
      userId: usuario.id,
    })

    const evento = await pb.collection('eventos').getOne(eventoIdFinal!)

    let link_pagamento: string | undefined

    try {
      const cfg = await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${lider.cliente}'`)

      if (cfg?.confirma_inscricoes === false && evento.cobra_inscricao) {
        const base = req.nextUrl.origin

        const pedidoRes = await fetch(`${base}/api/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_inscricao: inscricao.id }),
        })

        if (pedidoRes.ok) {
          const { pedidoId, valor } = await pedidoRes.json()
          logRocketEvent('pedido_criado_auto', {
            pedidoId,
            inscricaoId: inscricao.id,
          })

          const asaasRes = await fetch(`${base}/api/asaas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pedidoId,
              valorBruto: valor,
              paymentMethod,
              installments,
            }),
          })

          if (asaasRes.ok) {
            const data = await asaasRes.json()
            link_pagamento = data.url
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _vencimento = data.vencimento
          } else {
            await pb.collection('pedidos').delete(pedidoId)
          }
        }
      }
    } catch (e) {
      console.error('Erro ao gerar pagamento automático:', e)
    }

    const responseData: Record<string, unknown> = {
      sucesso: true,
      inscricaoId: inscricao.id,
      nome,
      email,
      tamanho,
      produto: produtoIdFinal,
      genero,
      responsavel: liderId,
    }

    if (link_pagamento) {
      responseData.link_pagamento = link_pagamento
    }

    let eventType: 'nova_inscricao' | 'confirmacao_inscricao' =
      'confirmacao_inscricao'

    try {
      const cfgConfirm = await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${lider.cliente}'`)
      if (cfgConfirm?.confirma_inscricoes === true) {
        eventType = 'nova_inscricao'
      }
    } catch (e) {
      console.error('Erro ao verificar confirma_inscricoes:', e)
    }

    const payload: Record<string, unknown> = {
      eventType,
      userId: usuario.id,
    }
    if (eventType === 'confirmacao_inscricao' && link_pagamento) {
      payload.paymentLink = link_pagamento
    }

    try {
      await fetch(`${req.nextUrl.origin}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.error('Erro ao enviar e-mail de inscrição:', e)
    }

    try {
      await fetch(`${req.nextUrl.origin}/api/chats/message/sendWelcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.error('Erro ao enviar WhatsApp de inscrição:', e)
    }

    try {
      await fetch(`${req.nextUrl.origin}/api/chats/message/sendWelcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'confirmacao_pendente_lider',
          userId: liderId,
          inscritoNome: nome,
          eventoTitulo: evento.titulo,
        }),
      })
    } catch (e) {
      console.error('Erro ao enviar WhatsApp para o líder:', e)
    }

    logRocketEvent('inscricao_criada', {
      inscricaoId: inscricao.id,
      responsavel: liderId,
    })

    return NextResponse.json(responseData)
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar inscrição: ${String(err)}`)
    return NextResponse.json(
      { erro: 'Erro ao processar a inscrição.' },
      { status: 500 },
    )
  }
}
