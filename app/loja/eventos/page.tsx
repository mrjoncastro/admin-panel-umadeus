import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { formatDate } from '@/utils/formatDate'
import type { Evento } from '@/types'

export const dynamic = 'force-dynamic'

async function getEventos(): Promise<Evento[]> {
  try {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const h = await headers()
    const host = h.get('host')
    if (!host) return []
    const res = await fetch(`${protocol}://${host}/api/eventos`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Evento[]
  } catch {
    return []
  }
}

export default async function EventosPage() {
  const eventos = (await getEventos()).filter((e) => e.status !== 'realizado')

  return (
    <main className="px-4 py-10 md:px-16 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-10">Eventos</h1>
      {eventos.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum evento disponível no momento.</p>
      ) : (
        <div role="list" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <article
              key={evento.id}
              role="listitem"
              className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col"
            >
              {evento.imagem ? (
                <figure className="w-full h-56">
                  <Image
                    src={evento.imagem}
                    alt={`Imagem do evento ${evento.titulo}`}
                    width={640}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </figure>
              ) : (
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}

              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold">{evento.titulo}</h2>
                <p className="text-sm text-gray-600">{evento.descricao}</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(evento.data)}</p>
                <p className="text-sm text-gray-500 mt-2">{evento.cidade}</p>
                <Link href={`/loja/eventos/${evento.id}`} className="btn btn-primary mt-auto">
                  Inscrever-se
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
