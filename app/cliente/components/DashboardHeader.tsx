'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Pedido, Inscricao } from '@/types'

export default function DashboardHeader() {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const headers = getAuthHeaders(pb)
    fetch('/api/inscricoes', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setInscricoes(Array.isArray(data) ? data : []))
      .catch(() => setInscricoes([]))

    fetch('/api/pedidos', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => setPedidos([]))
  }, [authChecked, user, pb])

  if (!authChecked) return null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Olá, {user?.nome?.split(' ')[0] || 'cliente'}!
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm">Total de Inscrições</p>
          <p className="text-2xl font-bold">{inscricoes.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm">Total de Pedidos</p>
          <p className="text-2xl font-bold">{pedidos.length}</p>
        </div>
      </div>
    </div>
  )
}
