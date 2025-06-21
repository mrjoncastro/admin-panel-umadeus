'use client'
import { useEffect, useState } from 'react'

import { useAuthContext } from '@/lib/context/AuthContext'
import type { Produto } from '@/types'

export default function useProdutos() {
  const { tenantId } = useAuthContext()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    fetch('/api/produtos', { credentials: 'include' })
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
  }, [tenantId])

  return { produtos, loading }
}
