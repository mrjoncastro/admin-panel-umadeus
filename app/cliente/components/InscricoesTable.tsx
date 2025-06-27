'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Inscricao } from '@/types'
import { formatDate } from '@/utils/formatDate'

export default function InscricoesTable({ limit }: { limit?: number }) {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const headers = getAuthHeaders(pb)
    fetch('/api/inscricoes', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) =>
        setInscricoes(
          Array.isArray(data) ? data.slice(0, limit ?? data.length) : [],
        ),
      )
      .catch(() => setInscricoes([]))
  }, [authChecked, user, pb, limit])

  if (!authChecked) return null

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Inscrições</h3>
      <table className="table-base">
        <thead>
          <tr>
            <th>Status</th>
            <th>Evento</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {inscricoes.map((i) => (
            <tr key={i.id}>
              <td className="capitalize">{i.status}</td>
              <td>{i.expand?.evento?.titulo || '-'}</td>
              <td>{i.created ? formatDate(i.created) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
