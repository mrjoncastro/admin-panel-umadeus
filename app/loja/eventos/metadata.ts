import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Eventos'
  const description = 'Confira nossos próximos eventos.'
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
