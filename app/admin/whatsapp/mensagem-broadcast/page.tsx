'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

interface Stats {
  total: number
  sent: number
  failed: number
  pending: number
}

export default function BroadcastPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const { showSuccess, showError } = useToast()

  const [alvo, setAlvo] = useState<'lideres' | 'inscritos' | 'pendentes'>('lideres')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  async function fetchStats() {
    try {
      const res = await fetch('/api/chats/message/broadcast')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        if (data.pending === 0 && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = undefined
        }
      }
    } catch {
      /* ignore */
    }
  }

  async function iniciar() {
    if (!mensagem.trim()) {
      showError('Mensagem obrigatória')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/chats/message/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: alvo, message: mensagem }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccess('Mensagens enfileiradas')
        setStats(data)
        if (!intervalRef.current) {
          intervalRef.current = setInterval(fetchStats, 2000)
        }
      } else {
        showError(data.error || 'Erro ao iniciar')
      }
    } catch {
      showError('Erro ao iniciar')
    } finally {
      setLoading(false)
    }
  }

  async function cancelar() {
    try {
      await fetch('/api/chats/message/broadcast', { method: 'DELETE' })
      showSuccess('Broadcast cancelado')
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = undefined
      fetchStats()
    } catch {
      showError('Erro ao cancelar')
    }
  }

  useEffect(() => {
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 2000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!authChecked) return <LoadingOverlay show text="Carregando" />

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Broadcast WhatsApp</h1>
      <div className="flex flex-col gap-3">
        <select
          className="border p-2 rounded"
          value={alvo}
          onChange={(e) =>
            setAlvo(e.target.value as 'lideres' | 'inscritos' | 'pendentes')
          }
        >
          <option value="lideres">Líderes</option>
          <option value="inscritos">Inscritos</option>
          <option value="pendentes">Pendentes</option>
        </select>
        <textarea
          className="border rounded p-2"
          rows={4}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={iniciar}
          disabled={loading}
        >
          Enviar
        </button>
        {stats && (
          <div className="mt-4 flex flex-col gap-1">
            <span>Total: {stats.total}</span>
            <span>Enviadas: {stats.sent}</span>
            <span>Falhas: {stats.failed}</span>
            <span>Pendentes: {stats.pending}</span>
            {stats.pending > 0 && (
              <button
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
                onClick={cancelar}
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
      <LoadingOverlay show={loading} />
    </div>
  )
}
