'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import type { Inscricao } from '@/types'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function NotificationBell() {
  const { tenantId, isLoggedIn, isLoading } = useAuthContext()
  const [count, setCount] = useState(0)
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isLoading || !isLoggedIn) {
      return
    }

    const fetchData = async () => {
      try {
        const [insRes, pedRes] = await Promise.all([
          fetch(
            `/api/inscricoes?${new URLSearchParams({
              status: 'pendente',
              perPage: '5',
            }).toString()}`,
            { credentials: 'include' },
          ).then((r) => r.json()),
          fetch(
            `/api/pedidos?${new URLSearchParams({
              status: 'pendente',
              perPage: '1',
            }).toString()}`,
            { credentials: 'include' },
          ).then((r) => r.json()),
        ])

        const insList = Array.isArray(insRes.items) ? insRes.items : insRes
        const pedidos = Array.isArray(pedRes.items) ? pedRes.items : pedRes
        setCount(insList.length + pedidos.length)
        setInscricoes(insList)
      } catch (err) {
      }
    }

    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [tenantId, isLoggedIn, isLoading])

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        aria-label="Notificações"
        onClick={() => setOpen((o) => !o)}
        className="relative bg-[var(--color-secondary)] text-[var(--background)] p-2 rounded-full shadow"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs h-4 min-w-4 flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-2 w-72 max-h-60 overflow-auto bg-white dark:bg-zinc-900 text-[var(--foreground)] dark:text-white rounded shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-zinc-700">
            <span className="font-semibold">Novas inscrições</span>
            <button aria-label="Fechar" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <ul className="p-2 text-sm space-y-1">
            {inscricoes.length === 0 && (
              <li className="text-center py-4">Sem inscrições pendentes</li>
            )}
            {inscricoes.map((i) => (
              <li
                key={i.id}
                className="border-b last:border-b-0 pb-1 mb-1 dark:border-zinc-700"
              >
                <span className="font-medium">{i.nome}</span> -{' '}
                {i.expand?.campo?.nome || '—'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
