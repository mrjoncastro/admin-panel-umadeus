import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Inscrição enviada'
  const description = 'Sua inscrição foi registrada com sucesso.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
