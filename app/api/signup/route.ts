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
    const tenantId = await getTenantFromHost()
    const telefoneNumerico = String(telefone).replace(/\D/g, '')
    const cpfNumerico = String(cpf).replace(/\D/g, '')
    const usuario = await pb.collection('usuarios').create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      password: String(senha),
      passwordConfirm: String(senha),
      role: 'usuario',
      ...(tenantId ? { cliente: tenantId } : {}),
    })

    try {
      await fetch('/api/email', {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'novo_usuario',
          userId: usuario.id,
        }),
      })
    } catch (err) {
      console.error('Falha ao enviar email de boas-vindas', err)
    }

    try {
      await fetch('/api/chats/message/sendWelcome', {
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
