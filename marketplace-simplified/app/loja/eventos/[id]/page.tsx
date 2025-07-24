import Image from 'next/image'
import { headers } from 'next/headers'
import { ConsultaInscricao } from '@/components/organisms'
import type { Evento } from '@/types'

async function getEvento(id: string): Promise<Evento | null> {
  try {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const h = await headers()
    const host = h.get('host')
    if (!host) return null

    const res = await fetch(`${protocol}://${host}/api/eventos/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as Evento
  } catch {
    return null
  }
}
export default async function EventoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const evento = await getEvento(id)

  if (!evento) {
    return (
      <main className="px-4 py-10 md:px-16 font-sans">
        <p className="text-center text-red-500">Evento não encontrado.</p>
      </main>
    )
  }

  const inscricoesEncerradas = evento.status === 'realizado'

  return (
    <main className="px-4 py-10 md:px-16 space-y-6 font-sans">
      {evento.imagem && (
        <Image
          src={evento.imagem}
          alt={`Imagem do evento ${evento.titulo}`}
          width={640}
          height={320}
          className="w-full h-56 object-cover rounded-lg"
        />
      )}
      <h1 className="text-2xl text-center font-bold">{evento.titulo}</h1>
      <p className="text-center">{evento.descricao}</p>
      {inscricoesEncerradas ? (
        <p className="text-center text-gray-500">Inscrições encerradas</p>
      ) : (
        <ConsultaInscricao
          eventoId={id}
          inscricoesEncerradas={inscricoesEncerradas}
        />
      )}
    </main>
  )
}
