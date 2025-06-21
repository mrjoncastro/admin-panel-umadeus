import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const inscricao = await pb.collection('inscricoes').getOne(id)
    if (inscricao.criado_por !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    await pb.collection('inscricoes').update(id, { status: 'cancelado' })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao cancelar inscricao:', err)
    return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
  }
}
