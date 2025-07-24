// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

'use client'
import { useEffect, useState, useMemo } from 'react'

import { useAuthContext } from '@/lib/context/AuthContext'
// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Inscricao } from '@/types'

export default function useInscricoes() {
  const { tenantId } = useAuthContext()
  // const pb = useMemo(() => createPocketBase(), []) // [REMOVED]
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    const headers = getAuthHeaders(pb)
    fetch('/api/inscricoes', { headers, credentials: 'include' })
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
