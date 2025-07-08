'use client'
import { useEffect, useState, useMemo } from 'react'

import { useAuthContext } from '@/lib/context/AuthContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Produto } from '@/types'

export default function useProdutos() {
  const { tenantId } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])
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
