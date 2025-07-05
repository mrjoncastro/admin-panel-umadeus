'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import type { Inscricao } from '@/types'
import { formatDate } from '@/utils/formatDate'

export interface InscricoesTableProps {
  limit?: number
  inscricoes?: Inscricao[]
  variant?: 'default' | 'details'
}

export default function InscricoesTable({
  limit,
  inscricoes: inscricoesProp,
  variant = 'default',
}: InscricoesTableProps) {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(
    inscricoesProp ?? [],
  )

  useEffect(() => {
    if (inscricoesProp) return
    if (!authChecked || !user) return
    const headers = getAuthHeaders(pb)
    fetch('/api/inscricoes', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? (data.items as Inscricao[])
            : []
        setInscricoes(items.slice(0, limit ?? items.length))
      })
      .catch(() => setInscricoes([]))
  }, [authChecked, user, pb, limit, inscricoesProp])

  if (!authChecked) return null

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Inscrições</h3>
      <table className="table-base">
        <thead>
          {variant === 'details' ? (
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Status</th>
            </tr>
          ) : (
            <tr>
              <th>Status</th>
              <th>Evento</th>
              <th>Data</th>
            </tr>
          )}
        </thead>
        <tbody>
          {inscricoes.map((i) => (
            variant === 'details' ? (
              <tr key={i.id}>
                <td>{i.nome}</td>
                <td>{i.cpf || '-'}</td>
                <td>{i.email || '-'}</td>
                <td className="capitalize">{i.status}</td>
              </tr>
            ) : (
              <tr key={i.id}>
                <td className="capitalize">{i.status}</td>
                <td>{i.expand?.evento?.titulo || '-'}</td>
                <td>{i.created ? formatDate(i.created) : '-'}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  )
}
