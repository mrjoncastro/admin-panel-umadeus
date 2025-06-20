import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    const { nome } = await req.json()
    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    const slug = nome.toLowerCase().replace(/\s+/g, '-')
    const categoria = await pb
      .collection('categorias')
      .update(id, { nome, slug })
    return NextResponse.json(categoria, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao atualizar categoria: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    await pb.collection('categorias').delete(id)
    return NextResponse.json({ sucesso: true }, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao excluir categoria: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
