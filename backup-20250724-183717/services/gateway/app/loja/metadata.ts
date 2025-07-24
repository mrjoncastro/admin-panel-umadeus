// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import type { Metadata } from 'next'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function generateMetadata(): Promise<Metadata> {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  const list = await // pb. // [REMOVED] collection('produtos').getList(1, 1, {
    filter: tenantId ? `ativo = true && cliente='${tenantId}'` : 'ativo = true',
    sort: '-created',
  })
  const produto = list.items[0]
  if (!produto) {
    return {
      title: 'Loja',
      description: 'Produtos e eventos',
    }
  }
  const imagem =
    produto.imagens && produto.imagens.length
      ? // pb. // [REMOVED] files.getURL(produto, produto.imagens[0])
      : '/img/og-default.jpg'
  const title = `Loja - ${produto.nome}`
  const description = produto.descricao || ''
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imagem],
    },
  }
}
