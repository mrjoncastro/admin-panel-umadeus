import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/products/getProductBySlug'

interface Params {
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const produto = await getProductBySlug(params.slug)
  if (!produto) {
    return {
      title: 'Produto não encontrado',
      description: 'Detalhes não disponíveis',
    }
  }
  const imagem = Array.isArray(produto.imagens)
    ? produto.imagens[0]
    : typeof produto.imagens === 'object'
      ? Object.values(produto.imagens as Record<string, string[]>)[0]?.[0]
      : produto.imagem || undefined
  return {
    title: produto.nome,
    description: produto.descricao || '',
    openGraph: {
      title: produto.nome,
      description: produto.descricao || '',
      ...(imagem ? { images: [imagem] } : {}),
    },
  }
}
