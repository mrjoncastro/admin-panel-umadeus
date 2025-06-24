import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Carrinho'
  const description = 'Itens selecionados para compra.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
