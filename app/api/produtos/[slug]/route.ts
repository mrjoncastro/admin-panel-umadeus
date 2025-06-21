import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import type { Produto } from '@/types'

export async function GET(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  const pb = 'error' in auth ? createPocketBase() : auth.pbSafe
  const role = 'error' in auth ? null : auth.user.role
  const tenantId = await getTenantFromHost()

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não informado' }, { status: 400 })
  }
  const slug = req.nextUrl.pathname.split('/').pop() ?? ''
  let filter = `slug = '${slug}' && cliente='${tenantId}'`
  if (!role) {
    filter += " && exclusivo_user = false"
  }
  try {
    const p = await pb.collection('produtos').getFirstListItem<Produto>(filter)
    const imagens = Array.isArray(p.imagens)
      ? p.imagens.map((img) => pb.files.getURL(p, img))
      : Object.fromEntries(
          Object.entries((p.imagens ?? {}) as Record<string, string[]>).map(
            ([g, arr]) => [g, arr.map((img) => pb.files.getURL(p, img))],
          ),
        )
    return NextResponse.json({ ...p, imagens })
  } catch {
    return NextResponse.json(
      { error: 'Produto não encontrado' },
      { status: 404 },
    )
  }
}
