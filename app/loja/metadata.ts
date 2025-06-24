import createPocketBase from '@/lib/pocketbase'
import type { Metadata } from 'next'
import { getTenantFromHost } from '@/lib/getTenantFromHost'

export async function generateMetadata(): Promise<Metadata> {
  const pb = createPocketBase()
  const tenantId = await getTenantFromHost()
  const list = await pb.collection('produtos').getList(1, 1, {
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
      ? pb.files.getURL(produto, produto.imagens[0])
      : undefined
  const title = `Loja - ${produto.nome}`
  const description = produto.descricao || ''
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imagem ? { images: [imagem] } : {}),
    },
  }
}
