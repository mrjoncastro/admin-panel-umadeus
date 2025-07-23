// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

'use client'
import { useEffect, useState, useMemo } from 'react'

import { useAuthContext } from '@/lib/context/AuthContext'
// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Produto } from '@/types'

export default function useProdutos() {
  const { tenantId } = useAuthContext()
  // const pb = useMemo(() => createPocketBase(), []) // [REMOVED]
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    const headers = getAuthHeaders(pb)
    fetch('/api/produtos', { headers, credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (active) setProdutos(data as Produto[])
      })
      .catch(() => {
        if (active) setProdutos([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [tenantId, pb])

  return { produtos, loading }
}
