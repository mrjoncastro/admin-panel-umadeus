import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Categorias'
  const description = 'Navegue pelas categorias de produtos e eventos.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
