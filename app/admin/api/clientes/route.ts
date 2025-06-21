import { NextRequest, NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function GET(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  const { user, pbSafe } = auth
  if (user.role !== 'coordenador' && user.role !== 'lider') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  try {
    const params = req.nextUrl.searchParams
    const filter = params.get('filter') || `cliente='${user.cliente}'`
    const expand = params.get('expand') || 'pedido,evento'
    const sort = params.get('sort') || '-created'
    const lista = await pbSafe.collection('inscricoes').getFullList({
      filter,
      expand,
      sort,
    })
    return NextResponse.json(lista)
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar clientes: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}
