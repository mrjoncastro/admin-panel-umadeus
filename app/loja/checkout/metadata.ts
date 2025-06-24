import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Checkout'
  const description = 'Finalize sua compra.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
