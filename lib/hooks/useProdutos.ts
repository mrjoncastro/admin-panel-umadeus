'use client'
import { useEffect, useState } from 'react'
import { fetchProdutos } from '@/lib/services/pocketbase'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { Produto } from '@/types'

export default function useProdutos() {
  const { tenantId } = useAuthContext()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    fetchProdutos(tenantId)
      .then((res) => {
        if (active) setProdutos(res as unknown as Produto[])
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
