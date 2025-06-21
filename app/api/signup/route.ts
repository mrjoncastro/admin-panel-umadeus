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
    const usuario = await pb.collection('usuarios').create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      telefone: String(telefone).trim(),
      cpf: String(cpf).trim(),
      password: String(senha),
      passwordConfirm: String(senha),
      role: 'usuario',
      ...(tenantId ? { cliente: tenantId } : {}),
    })
    return NextResponse.json(usuario, { status: 201 })
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown } }
    if (e.response?.data) {
      return NextResponse.json(e.response.data, { status: 400 })
    }
    console.error('Erro em /api/signup:', err)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}
