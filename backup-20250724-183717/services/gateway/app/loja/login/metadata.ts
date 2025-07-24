import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Entrar'
  const description = 'Acesse sua conta ou cadastre-se.'
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
