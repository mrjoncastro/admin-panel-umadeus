'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { formatDate } from '@/utils/formatDate'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Evento {
  id: string
  titulo: string
  data?: string
  cidade?: string
  status?: string
}

export default function AdminEventosPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { authChecked } = useAuthGuard(['coordenador'])

  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, ctxUser?.role, router, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return

    async function fetchEventos() {
      try {
        const res = await fetch('/admin/api/eventos')
        const data = await res.json()
        setEventos(Array.isArray(data) ? data : (data.items ?? []))
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
      }
    }

    fetchEventos()
  }, [isLoggedIn, ctxUser?.role, authChecked])

  async function handleDelete(id: string) {
    if (!confirm('Confirma excluir?')) return
    await fetch(`/admin/api/eventos/${id}`, {
      method: 'DELETE',
    })
    setEventos((prev) => prev.filter((e) => e.id !== id))
  }

  if (!authChecked) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Eventos
        </h2>
        <Link
          href="/admin/eventos/novo"
          className="btn btn-primary btn-novo-evento"
          data-tour="btn-novo-evento"
        >
          + Novo Evento
        </Link>
      </div>
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 tabela-eventos" data-tour="tabela-eventos">
        <table className="table-base">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-neutral-400">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            ) : (
              eventos.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.titulo}</td>
                  <td>{ev.data ? formatDate(ev.data) : '—'}</td>
                  <td>{ev.status ?? '—'}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/eventos/editar/${ev.id}`}
                        className="btn"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn"
                        style={{ color: 'var(--accent)' }}
                        onClick={() => handleDelete(ev.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
