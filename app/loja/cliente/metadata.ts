import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Área do Cliente'
  const description = 'Consulte suas inscrições e pedidos.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
