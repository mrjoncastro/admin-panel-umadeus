'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import type { Inscricao } from '@/types'

export default function InscricoesTable({ limit }: { limit?: number }) {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])

  useEffect(() => {
    if (!authChecked || !user) return
    const token = pb.authStore.token
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-PB-User': JSON.stringify(user),
    }
    fetch('/api/inscricoes', { headers })
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
              <td>
                {i.created
                  ? new Date(i.created).toLocaleDateString('pt-BR')
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
