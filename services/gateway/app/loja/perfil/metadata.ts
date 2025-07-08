import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Meu Perfil'
  const description = 'Gerencie suas informações pessoais.'
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
