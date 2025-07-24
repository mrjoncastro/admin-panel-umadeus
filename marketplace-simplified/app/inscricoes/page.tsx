'use client'

import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { ConsultaInscricao } from '@/components/organisms'

export default function InscricoesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuthContext()

  const eventoId = searchParams.get('evento') || ''
  const cpf = searchParams.get('cpf') || ''
  const email = searchParams.get('email') || ''

  const [evento, setEvento] = useState<{
    id: string
    titulo: string
    descricao: string
    imagem?: string
    status?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      const params = new URLSearchParams()
      if (eventoId) params.append('evento', eventoId)
      if (cpf) params.append('cpf', cpf)
      if (email) params.append('email', email)
      router.replace(`/login?redirectTo=/inscricoes?${params.toString()}`)
    }
  }, [isLoggedIn, isLoading, router, eventoId, cpf, email])

  useEffect(() => {
    async function fetchEvento() {
      if (!eventoId) {
        setLoading(false)
        setEvento(null)
        return
      }
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

  if (!isLoading && !isLoggedIn) {
    return null
  }

  if (loading) {
    return (
      <div role="status" className="p-8">
        <p className="text-center">Carregando evento...</p>
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

  const inscricoesEncerradas = evento.status === 'realizado'

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
        <ConsultaInscricao
          eventoId={eventoId}
          inscricoesEncerradas={inscricoesEncerradas}
        />
      </section>
    </main>
  )
}
