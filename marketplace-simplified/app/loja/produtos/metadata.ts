import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Produtos'
  const description = 'Veja todos os produtos disponíveis.'
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
