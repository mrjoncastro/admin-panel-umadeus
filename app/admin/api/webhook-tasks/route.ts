import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logConciliacaoErro } from '@/lib/server/logger'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth
  try {
    const tasks = await pb.collection('webhook_tasks').getFullList({
      sort: '-created',
    })
    return NextResponse.json(tasks)
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar webhook tasks: ${String(err)}`)
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 })
  }
}
