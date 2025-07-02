'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'

interface InscricaoStatusProps {
  eventoId: string
}

interface Inscricao {
  id: string
  status?: string
  evento?: string
}

export default function InscricaoStatus({ eventoId }: InscricaoStatusProps) {
  const { isLoggedIn } = useAuthContext()
  const [status, setStatus] = useState<string | undefined>()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    fetch('/loja/api/minhas-inscricoes', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const items: Inscricao[] = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : []
        const match = items.find((i) => i.evento === eventoId)
        setStatus(match?.status)
      })
      .catch(() => setStatus(undefined))
      .finally(() => setLoaded(true))
  }, [eventoId, isLoggedIn])

  if (!isLoggedIn || !loaded) return null

  return (
    <p className="text-center text-sm text-neutral-700">
      {status
        ? `Você já se inscreveu. Status: ${status}`
        : 'Nenhuma inscrição encontrada para este evento'}
    </p>
  )
}
