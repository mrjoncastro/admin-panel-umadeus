'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Spinner from '@/components/atoms/Spinner'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-2xl shadow-2xl">
      <h1 className="text-2xl font-extrabold text-purple-700 mb-3 text-center">
        Inscrições
      </h1>
      {eventos.length === 0 ? (
        <p className="text-center text-gray-600">
          Nenhum evento disponível no momento.
        </p>
      ) : (
        <ul className="space-y-2">
          {eventos.map((ev) => (
            <li key={ev.id}>
              <Link
                href={`/inscricoes/${liderId}/${ev.id}`}
                className="block border border-purple-300 rounded-lg p-3 hover:bg-purple-50"
              >
                <span className="font-medium">{ev.titulo}</span>
                {ev.data && (
                  <span className="block text-sm text-gray-500">
                    {formatDate(ev.data)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
