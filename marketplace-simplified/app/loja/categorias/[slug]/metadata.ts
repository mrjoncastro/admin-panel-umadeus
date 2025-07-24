// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

import type { Metadata } from 'next'
// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  let nome = params.slug
  try {
    const cat = await pb
      .collection('categorias')
      .getFirstListItem(`slug='${params.slug}' && cliente='${tenantId}'`)
    if (cat?.nome) nome = cat.nome
  } catch {
    // ignore errors
  }
  const title = `Categoria: ${nome}`
  const description = `Produtos da categoria ${nome}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/img/og-default.jpg'],
    },
  }
}
