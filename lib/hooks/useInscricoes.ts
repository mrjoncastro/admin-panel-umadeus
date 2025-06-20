'use client'
import { useEffect, useState } from 'react'
import { fetchInscricoes } from '@/lib/services/pocketbase'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { Inscricao } from '@/types'

export default function useInscricoes() {
  const { tenantId } = useAuthContext()
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    let active = true
    fetchInscricoes(tenantId)
      .then((res) => {
        if (active) setInscricoes(res as Inscricao[])
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
