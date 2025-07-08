import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id) {
    return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  }

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

    const campo = await pb.collection('campos').update(id, { nome })

    return NextResponse.json(campo, { status: 200 })
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro: ${String(err)}`)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id) {
    return NextResponse.json({ error: 'ID ausente.' }, { status: 400 })
  }

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { pb } = auth

  try {
    await pb.collection('campos').delete(id)
    return NextResponse.json({ sucesso: true }, { status: 200 })
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro: ${String(err)}`)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
