import type { Metadata } from 'next'
import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const pb = createPocketBase()
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
