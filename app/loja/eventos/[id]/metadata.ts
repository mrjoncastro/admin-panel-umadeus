import type { Metadata } from 'next'
import { headers } from 'next/headers'

async function getEvento(id: string) {
  try {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const h = await headers()
    const host = h.get('host')
    if (!host) return null
    const res = await fetch(`${protocol}://${host}/api/eventos/${id}`)
    if (!res.ok) return null
    return (await res.json()) as { titulo: string; descricao: string; imagem?: string }
  } catch {
    return null
  }
}

interface Params { id: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const evento = await getEvento(params.id)
  const title = evento ? evento.titulo : 'Evento'
  const description = evento?.descricao || 'Detalhes do evento.'
  const image = evento?.imagem || '/img/og-default.jpg'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
  }
}
