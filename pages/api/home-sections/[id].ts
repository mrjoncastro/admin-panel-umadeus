import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'

export const config = { runtime: 'edge' }

export default async function handler(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() || ''
  if (!id) return NextResponse.json({ error: 'ID inv\u00e1lido' }, { status: 400 })

  const method = req.method || 'GET'
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth
  try {
    const rec = await pb.collection('home_sections').getOne(id)
    if (rec.cliente !== user.cliente) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    if (method === 'PUT') {
      const data = await req.json()
      const updated = await pb.collection('home_sections').update(id, data)
      return NextResponse.json(updated)
    }
    if (method === 'DELETE') {
      await pb.collection('home_sections').delete(id)
      return NextResponse.json({ ok: true })
    }
    return new NextResponse('Method Not Allowed', { status: 405 })
  } catch (err) {
    console.error('Erro em home-sections/[id]:', err)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}
