import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/apiAuth'
import type { UserModel } from '@/types/UserModel'

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'coordenador')
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { pb, user } = auth

  const role = req.nextUrl.searchParams.get('role') || 'todos'
  let filter = `cliente='${user.cliente}'`
  if (role && role !== 'todos') {
    filter += ` && role='${role}'`
  }

  try {
    const list = await pb.collection('usuarios').getFullList<UserModel>({
      filter,
      sort: 'nome',
    })
    const result = list.map((u) => {
      const avatar = (u as Record<string, unknown>).avatar as string | undefined
      return {
        id: u.id,
        name: u.nome,
        phone: u.telefone ?? undefined,
        avatarUrl: avatar ? pb.files.getUrl(u, avatar) : undefined,
      }
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar contato'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
