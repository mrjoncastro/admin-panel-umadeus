'use client'
import { useEffect, useState, useMemo } from 'react'

import { useAuthContext } from '@/lib/context/AuthContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Inscricao } from '@/types'

export default function useInscricoes() {
  const { tenantId } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    const headers = getAuthHeaders(pb)
    fetch('/loja/api/minhas-inscricoes', { headers, credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : []
        if (active) setInscricoes(items as Inscricao[])
      })
      .catch(() => {
        if (active) setInscricoes([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [tenantId, pb])

  return { inscricoes, loading }
}
