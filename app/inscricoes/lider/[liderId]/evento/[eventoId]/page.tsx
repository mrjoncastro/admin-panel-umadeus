'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { InscricaoWizard } from '@/components/organisms'

export default function InscricaoPage() {
  // Extrai params apenas uma vez
  const { liderId, eventoId } = useParams() as {
    liderId: string
    eventoId: string
  }

  // Estado para dados de evento e controle de carregamento/erro
  const [evento, setEvento] = useState<{
    id: string
    titulo: string
    descricao: string
    imagem?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvento() {
      try {
        const res = await fetch(`/api/eventos/${eventoId}`)
        if (!res.ok) throw new Error('Falha ao buscar evento')
        const data = await res.json()
        setEvento(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvento()
  }, [eventoId])

  // Renderização condicional de estados
  if (loading) {
    return (
      <div role="status" className="p-8">
        <p className="text-center">Carregando evento...</p>
        {/* Aqui poderia usar um skeleton loader */}
      </div>
    )
  }

  if (error || !evento) {
    return (
      <div role="alert" className="p-8 text-center text-red-600">
        <p>Não foi possível carregar os dados do evento.</p>
        {error && <p className="mt-2">Erro: {error}</p>}
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {evento.imagem && (
        <Image
          src={evento.imagem}
          alt={`Imagem do evento ${evento.titulo}`}
          width={640}
          height={320}
          className="w-full h-56 object-cover rounded-lg"
          priority
        />
      )}

      <h1 className="text-3xl text-center font-bold mt-6">{evento.titulo}</h1>
      <p className="text-center text-gray-700 mb-10">{evento.descricao}</p>

      <section aria-label="Formulário de inscrição">
        <InscricaoWizard liderId={liderId} eventoId={eventoId} />
      </section>
    </main>
  )
}
