// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import { NextRequest, NextResponse } from 'next/server'
// [REMOVED] PocketBase import
import { filtrarProdutos, ProdutoRecord } from '@/lib/products'
import { pbRetry } from '@/lib/pbRetry'
import { getUserFromHeaders } from '@/lib/getUserFromHeaders'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function GET(req: NextRequest) {
  const auth = getUserFromHeaders(req)
  const pb = 'error' in auth ? createPocketBase(false) : auth.pbSafe
  const role = 'error' in auth ? null : auth.user.role
  const categoria = req.nextUrl.searchParams.get('categoria') || undefined
  const tenantId = await getTenantFromHost()

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant não informado' }, { status: 400 })
  }

  try {
    let baseFilter = `ativo = true && (cliente='${tenantId}' || publico = true)`
    if (!role) {
      baseFilter += ' && exclusivo_user = false'
    }
    const filterString = categoria
      ? `${baseFilter} && categoria = '${categoria}'`
      : baseFilter

    const produtos = await pbRetry(() =>
      // pb. // [REMOVED] collection('produtos').getFullList<ProdutoRecord>({
        filter: filterString,
        sort: '-created',
      }),
    )

    // Aplica filtro extra (caso sua função faça algo a mais)
    const ativos = filtrarProdutos(produtos, categoria, !!role)

    // Monta URLs completas das imagens
    const comUrls = ativos.map((p) => ({
      ...p,
      imagens: (p.imagens || []).map((img) => // pb. // [REMOVED] files.getURL(p, img)),
    }))

    return NextResponse.json(comUrls)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
