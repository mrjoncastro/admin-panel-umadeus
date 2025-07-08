import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { logConciliacaoErro } from '@/lib/server/logger'
import type { EventoRecord } from '@/lib/events'

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''
  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const pb = createPocketBase()
  try {
    const evento = await pb.collection('eventos').getOne<EventoRecord>(id, {
      expand: 'produtos,produto_inscricao',
    })
    const fileName = evento.imagem || evento.logo
    const withUrl = {
      ...evento,
      imagem: fileName ? pb.files.getURL(evento, fileName) : undefined,
    }
    return NextResponse.json(withUrl, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(`Erro ao obter evento: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}
