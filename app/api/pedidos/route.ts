import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'usuario')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const pedidos = await pb.collection('pedidos').getFullList({
      filter: `responsavel = "${user.id}"`,
      sort: '-created',
    })
    return NextResponse.json(pedidos, { status: 200 })
  } catch (err) {
    console.error('Erro ao listar pedidos:', err)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}
