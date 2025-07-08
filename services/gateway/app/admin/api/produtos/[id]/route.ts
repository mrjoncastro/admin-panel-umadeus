import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import { logInfo } from '@/lib/logger'
import { logConciliacaoErro } from '@/lib/server/logger'
import { calculateGross } from '@/lib/asaasFees'

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth

  try {
    const produto = await pb.collection('produtos').getOne(id)
    return NextResponse.json(produto, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao obter produto ${id}: ${String(err)} | host: ${pb.baseUrl}`,
    )
    return NextResponse.json({ error: 'Erro ao obter' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth

  try {
    const formData = await req.formData()

    formData.set('user_org', user.id)
    const preco = Number(formData.get('preco') || 0)
    const bruto = calculateGross(preco, 'pix', 1).gross
    formData.set('preco_bruto', String(bruto))

    logInfo('Atualizando produto', {
      pbHost: pb.baseUrl,
      userId: user.id,
      produtoId: id,
    })

    const produto = await pb.collection('produtos').update(id, formData)

    return NextResponse.json(produto, { status: 200 })
  } catch (err: unknown) {
    const pocketError =
      (err as { response?: unknown } | undefined)?.response || err

    await logConciliacaoErro(
      `Erro ao atualizar produto ${id}: ${String(err)} | host: ${
        pb.baseUrl
      } | user: ${user.id}`,
    )
    return NextResponse.json({ error: pocketError }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl
  const id = pathname.split('/').pop() ?? ''

  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const auth = requireRole(req, 'coordenador')

  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb } = auth

  try {
    await pb.collection('produtos').delete(id)
    return NextResponse.json({ sucesso: true }, { status: 200 })
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao excluir produto ${id}: ${String(err)} | host: ${pb.baseUrl}`,
    )
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 })
  }
}
