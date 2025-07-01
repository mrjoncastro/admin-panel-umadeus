import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function POST(req: NextRequest) {
  const pb = createPocketBase()
  try {
    const { nome, email, telefone, cpf, senha } = await req.json()
    if (!nome || !email || !telefone || !cpf || !senha) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }
    if (String(senha).length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter ao menos 8 caracteres.' },
        { status: 400 },
      )
    }
    const tenantId = await getTenantFromHost()
    const telefoneNumerico = String(telefone).replace(/\D/g, '')
    const cpfNumerico = String(cpf).replace(/\D/g, '')
    try {
      const dup = await pb.collection('usuarios').getList(1, 1, {
        filter: `cpf='${cpfNumerico}' || email='${email}' || telefone='${telefoneNumerico}'`,
      })
      if (dup.items.length > 0) {
        return NextResponse.json(
          { error: 'Já existe um usuário com este CPF ou e-mail.' },
          { status: 409 },
        )
      }
    } catch {}
    const usuario = await pb.collection('usuarios').create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      emailVisibility: true,
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      password: String(senha),
      passwordConfirm: String(senha),
      role: 'usuario',
      ...(tenantId ? { cliente: tenantId } : {}),
    })

    const base = req.nextUrl?.origin || req.headers.get('origin')
    if (!base) {
      console.error('Base URL não encontrada para envio de notificações')
      return NextResponse.json(
        { error: 'Base URL não encontrada' },
        { status: 500 },
      )
    }

    try {
      await fetch(`${base}/api/email`, {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'novo_usuario',
          userId: usuario.id,
          loginLink: base + '/login',
        }),
      })
    } catch (err) {
      console.error('Falha ao enviar email de boas-vindas', err)
    }

    try {
      await fetch(`${base}/api/chats/message/sendWelcome`, {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'novo_usuario',
          userId: usuario.id,
        }),
      })
    } catch (err) {
      console.error('Falha ao enviar mensagem de boas-vindas', err)
    }

    return NextResponse.json(usuario, { status: 201 })
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown } }
    if (e.response?.data) {
      return NextResponse.json(e.response.data, { status: 400 })
    }
    console.error('Erro em /api/signup:', err)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 },
    )
  }
}
