import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import type { Produto, Inscricao } from '@/types'

export async function GET(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  const pb = 'error' in auth ? createPocketBase(false) : auth.pbSafe
  const role = 'error' in auth ? null : auth.user.role
  const tenantId = await getTenantFromHost()

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não informado' }, { status: 400 })
  }

  const slug = req.nextUrl.pathname.split('/').pop() ?? ''

  if (!slug) {
    return NextResponse.json({ error: 'Slug não informado' }, { status: 400 })
  }

  try {
    const p = await pb
      .collection('produtos')
      .getFirstListItem<Produto>(`slug="${slug}"`)

    if (p.cliente !== tenantId) {
      return NextResponse.json(
        { error: 'Produto não pertence ao tenant' },
        { status: 403 },
      )
    }
    if (!role && p.exclusivo_user) {
      return NextResponse.json(
        { error: 'Produto exclusivo para usuários logados' },
        { status: 403 },
      )
    }
    if (!p.ativo) {
      return NextResponse.json({ error: 'Produto inativo' }, { status: 404 })
    }

    const imagens = Array.isArray(p.imagens)
      ? p.imagens.map((img) => pb.files.getURL(p, img))
      : Object.fromEntries(
          Object.entries((p.imagens ?? {}) as Record<string, string[]>).map(
            ([g, arr]) => [g, arr.map((img) => pb.files.getURL(p, img))],
          ),
        )

    let inscricaoAprovada = false
    let inscricaoId: string | null = null
    if (
      p.requer_inscricao_aprovada &&
      p.evento_id &&
      !('error' in auth)
    ) {
      try {
        const inscricao = await pb
          .collection('inscricoes')
          .getFirstListItem<Inscricao>(
            `criado_por='${auth.user.id}' && evento='${p.evento_id}'`,
          )
        inscricaoAprovada = Boolean(inscricao.aprovada)
        inscricaoId = inscricao.id
      } catch {
        inscricaoAprovada = false
        inscricaoId = null
      }
    }

    return NextResponse.json({ ...p, imagens, inscricaoAprovada, inscricaoId })
  } catch (err: unknown) {
    const message = (err as Error)?.message ?? String(err)
    return NextResponse.json(
      { error: 'Produto não encontrado', detalhes: message },
      { status: 404 },
    )
  }
}
