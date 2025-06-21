import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'
import { ClientResponseError } from 'pocketbase'

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const pb = createPocketBase()
  try {
    const evento = await pb
      .collection('eventos')
      .getOne(id, { expand: 'produtos' })
    const withUrl = {
      ...evento,
      imagem: evento.imagem
        ? pb.files.getURL(evento, evento.imagem)
        : undefined,
    }
    return NextResponse.json(withUrl, { status: 200 })
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    await logConciliacaoErro(`Erro ao obter evento: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}
