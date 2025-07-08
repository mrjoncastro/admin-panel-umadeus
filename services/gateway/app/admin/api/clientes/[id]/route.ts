import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) {
    return NextResponse.json({ error: 'ID ausente' }, { status: 400 })
  }
  const auth = getUserFromHeaders(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  const { user, pbSafe } = auth
  if (user.role !== 'coordenador' && user.role !== 'lider') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  try {
    const data = await req.json()
    const record = await pbSafe.collection('inscricoes').update(id, data)
    return NextResponse.json(record)
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao atualizar inscricao ${id}: ${String(err)}`,
    )
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
