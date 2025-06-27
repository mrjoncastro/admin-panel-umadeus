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
    fetch('/api/inscricoes', { headers, credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (active) setInscricoes(data as Inscricao[])
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
  }, [tenantId])

  return { inscricoes, loading }
}
