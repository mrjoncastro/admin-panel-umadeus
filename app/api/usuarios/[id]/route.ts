import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  if (user.id !== id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  try {
    const data = await req.json()
    await pb.collection('usuarios').update(id, {
      nome: String(data.nome || '').trim(),
      telefone: String(data.telefone || '').trim(),
      cpf: String(data.cpf || '').trim(),
      data_nascimento: String(data.data_nascimento || ''),
      role: user.role,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
