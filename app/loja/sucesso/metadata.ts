import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Compra Concluída'
  const description = 'Seu pedido foi processado com sucesso.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
