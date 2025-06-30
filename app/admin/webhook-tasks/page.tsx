'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Task {
  id: string
  event: string
  status: string
  attempts: number
  max_attempts: number
  error?: string
  next_retry?: string | null
}

export default function WebhookTasksPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (!authChecked) return
    fetch('/admin/api/webhook-tasks')
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar tasks', err))
  }, [authChecked])

  if (!authChecked) return null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Webhook Tasks</h2>
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Status</th>
              <th>Tentativas</th>
              <th>Erro</th>
              <th>Próx. Retry</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-neutral-400">
                  Nenhuma task encontrada.
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.event}</td>
                  <td>{t.status}</td>
                  <td>
                    {t.attempts}/{t.max_attempts}
                  </td>
                  <td>{t.error || '—'}</td>
                  <td>
                    {t.next_retry ? new Date(t.next_retry).toLocaleString() : '—'}
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
