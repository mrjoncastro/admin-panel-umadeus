// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Pedido } from '@/types'

export default function PedidosTable({ limit }: { limit?: number }) {
  const { user, authChecked } = useAuthGuard(['usuario'])
  // const pb = useMemo(() => createPocketBase(), []) // [REMOVED]
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const headers = getAuthHeaders(pb)
    fetch('/api/pedidos', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? (data.items as Pedido[])
            : []
        setPedidos(items.slice(0, limit ?? items.length))
      })
      .catch(() => setPedidos([]))
  }, [authChecked, user, pb, limit])

  if (!authChecked) return null

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Pedidos</h3>
      <table className="table-base">
        <thead>
          <tr>
            <th>ID</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id_pagamento || p.id}</td>
              <td>R$ {Number(p.valor).toFixed(2)}</td>
              <td className="capitalize">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
