'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

interface BroadcastConfig {
  id: string
  delayBetweenMessages: number
  delayBetweenBatches: number
  batchSize: number
  maxMessagesPerMinute: number
  maxMessagesPerHour: number
  maxRetries: number
  retryDelay: number
  allowedHoursStart: number
  allowedHoursEnd: number
  timezone: string
}

export default function BroadcastConfigPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const { showSuccess, showError } = useToast()
  const [config, setConfig] = useState<BroadcastConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authChecked) return
    fetch('/api/chats/whatsapp/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig(data)
        setLoading(false)
      })
      .catch(() => {
        showError('Erro ao carregar configuração')
        setLoading(false)
      })
  }, [authChecked, showError])

  async function salvar() {
    if (!config) return
    try {
      const res = await fetch('/api/chats/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delayBetweenMessages: config.delayBetweenMessages,
          delayBetweenBatches: config.delayBetweenBatches,
          batchSize: config.batchSize,
          maxMessagesPerMinute: config.maxMessagesPerMinute,
          maxMessagesPerHour: config.maxMessagesPerHour,
          maxRetries: config.maxRetries,
          retryDelay: config.retryDelay,
          timezone: config.timezone,
          allowedHours: {
            start: config.allowedHoursStart,
            end: config.allowedHoursEnd,
          },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        showSuccess('Configuração salva')
      } else {
        const data = await res.json()
        showError(data.error || 'Erro ao salvar')
      }
    } catch {
      showError('Erro ao salvar')
    }
  }

  if (!authChecked) return <LoadingOverlay show text="Carregando" />
  if (loading || !config) return <LoadingOverlay show text="Carregando" />

  return (
    <div className="p-4 max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Configuração de Broadcast</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          salvar()
        }}
        className="space-y-3"
      >
        <label className="block">
          <span className="text-sm">Delay entre mensagens (ms)</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.delayBetweenMessages}
            onChange={(e) =>
              setConfig({ ...config, delayBetweenMessages: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Delay entre lotes (ms)</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.delayBetweenBatches}
            onChange={(e) =>
              setConfig({ ...config, delayBetweenBatches: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Tamanho do lote</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.batchSize}
            onChange={(e) => setConfig({ ...config, batchSize: Number(e.target.value) })}
          />
        </label>
        <label className="block">
          <span className="text-sm">Máx. msgs/minuto</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.maxMessagesPerMinute}
            onChange={(e) =>
              setConfig({ ...config, maxMessagesPerMinute: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Máx. msgs/hora</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.maxMessagesPerHour}
            onChange={(e) =>
              setConfig({ ...config, maxMessagesPerHour: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Máx. tentativas</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.maxRetries}
            onChange={(e) => setConfig({ ...config, maxRetries: Number(e.target.value) })}
          />
        </label>
        <label className="block">
          <span className="text-sm">Delay de retry (ms)</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.retryDelay}
            onChange={(e) => setConfig({ ...config, retryDelay: Number(e.target.value) })}
          />
        </label>
        <label className="block">
          <span className="text-sm">Horário permitido início</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.allowedHoursStart}
            onChange={(e) =>
              setConfig({ ...config, allowedHoursStart: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Horário permitido fim</span>
          <input
            type="number"
            className="input-base w-full"
            value={config.allowedHoursEnd}
            onChange={(e) =>
              setConfig({ ...config, allowedHoursEnd: Number(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="text-sm">Timezone</span>
          <input
            type="text"
            className="input-base w-full"
            value={config.timezone}
            onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Salvar
        </button>
      </form>
    </div>
  )
}
