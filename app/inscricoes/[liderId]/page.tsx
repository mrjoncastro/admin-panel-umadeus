'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { formatDate } from '@/utils/formatDate'
import type { Evento } from '@/types'

export default function EscolherEventoPage() {
  const params = useParams()
  const liderId = params.liderId as string
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventos() {
      try {
        const res = await fetch('/api/eventos')
        const data: Evento[] = await res.json()
        setEventos(Array.isArray(data) ? data : [])
      } catch {
        setEventos([])
      } finally {
        setLoading(false)
      }
    }
    fetchEventos()
  }, [])

  return (
    <main
      className="px-4 py-10 md:px-16 space-y-10"
      aria-labelledby="page-title"
    >
      <h1 id="page-title" className="text-3xl font-bold text-center mb-10">
        Inscrições
      </h1>
      {loading ? (
        <LoadingOverlay show={true} text="Carregando..." />
      ) : eventos.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhum evento disponível no momento.
        </p>
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
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold ${
                    evento.status === 'realizado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {evento.status === 'realizado' ? 'Realizado' : 'Em breve'}
                </span>

                <h2 className="text-lg font-semibold mt-2">{evento.titulo}</h2>
                <p className="text-sm text-gray-600">{evento.descricao}</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(evento.data)}
                </p>
                <p className="text-sm text-gray-500 mt-2">{evento.cidade}</p>

                <Link
                  href={`/inscricoes/${liderId}/${evento.id}`}
                  className="btn btn-primary mt-auto"
                >
                  Inscrever
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
