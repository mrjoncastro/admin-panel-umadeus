'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, X, Clock, StopCircle } from 'lucide-react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/atoms/Button'
import { Textarea } from '@/components/ui/textarea'

type Role = 'todos' | 'lider' | 'usuario'
interface Contact {
  id: string
  name: string
  phone?: string
  avatarUrl?: string
}

interface BroadcastProgress {
  total: number
  sent: number
  failed: number
  pending: number
  currentBatch: number
  totalBatches: number
  estimatedTimeRemaining: number
  isProcessing: boolean
}

export default function MensagemBroadcastPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const { showSuccess, showError } = useToast()
  const [role, setRole] = useState<Role>('todos')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null)
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!authChecked) return
    fetch(`/api/chats/contacts?role=${role}`)
      .then((r) => r.json())
      .then((data: Contact[]) => {
        setContacts(data)
        setSelected(new Set())
      })
      .catch(() => showError('Falha ao carregar contatos'))
  }, [role, authChecked, showError])

  // Polling do progresso quando há broadcast ativo
  useEffect(() => {
    if (broadcastProgress?.isProcessing) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch('/api/chats/message/broadcast')
          const data = await res.json()
          
          if (data.progress) {
            setBroadcastProgress(data.progress)
            
            // Se terminou, para o polling
            if (!data.progress.isProcessing) {
              clearInterval(interval)
              setProgressInterval(null)
              showSuccess(`✅ Broadcast concluído! ${data.progress.sent} enviados • ${data.progress.failed} falharam`)
            }
          } else {
            // Broadcast terminou
            setBroadcastProgress(null)
            clearInterval(interval)
            setProgressInterval(null)
          }
        } catch (error) {
          console.error('Erro ao buscar progresso:', error)
        }
      }, 2000) // Atualiza a cada 2 segundos
      
      setProgressInterval(interval)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [broadcastProgress?.isProcessing, showSuccess])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(id)) {
        s.delete(id)
      } else {
        s.add(id)
      }
      return s
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return showError('Digite uma mensagem')
    if (selected.size === 0) return showError('Selecione destinatários')

    setLoading(true)
    try {
      const res = await fetch('/api/chats/message/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          recipients: Array.from(selected),
        }),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.errors?.join(', ') || 'Erro no envio')
      
      showSuccess(data.message)
      setMessage('')
      setSelected(new Set())
      
      // Inicia monitoramento do progresso
      if (data.success) {
        setBroadcastProgress({
          total: data.totalMessages,
          sent: 0,
          failed: 0,
          pending: data.totalMessages,
          currentBatch: 0,
          totalBatches: Math.ceil(data.totalMessages / 3),
          estimatedTimeRemaining: data.estimatedTime * 60,
          isProcessing: true
        })
      }
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  const stopBroadcast = async () => {
    try {
      const res = await fetch('/api/chats/message/broadcast', { method: 'DELETE' })
      const data = await res.json()
      
      if (res.ok) {
        showSuccess(data.message)
        setBroadcastProgress(null)
        if (progressInterval) {
          clearInterval(progressInterval)
          setProgressInterval(null)
        }
      } else {
        showError(data.errors?.join(', ') || 'Erro ao parar broadcast')
      }
    } catch (error) {
      showError('Erro ao parar broadcast')
    }
  }

  if (!authChecked) return null

  let bodyContent: React.ReactNode
  if (!selected.size) {
    bodyContent = (
      <div className="flex-1 flex items-center justify-center text-muted">
        Selecione ao menos um contato
      </div>
    )
  } else {
    bodyContent = (
      <form
        onSubmit={submit}
        className="mt-auto bg-card border-t border-border"
      >
        <div className="flex flex-wrap gap-2 p-4">
          {Array.from(selected).map((id) => {
            const c = contacts.find((x) => x.id === id)!
            return (
              <span
                key={id}
                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full"
              >
                {c.name}
                <Button
                  variant="secondary"
                  className="p-1"
                  onClick={() => toggle(id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </span>
            )
          })}
        </div>

        <div className="flex items-center p-4">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows={1}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !message.trim()}
            className="ml-2"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Lista de contatos */}
      <aside className="w-80 bg-card border-r border-border overflow-auto">
        <div className="p-4">
          <select
            className="input-base"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading || broadcastProgress?.isProcessing}
          >
            <option value="todos">Todos</option>
            <option value="lider">Líderes</option>
            <option value="usuario">Usuários</option>
          </select>
        </div>
        <ul>
          {contacts.map((c) => {
            const sel = selected.has(c.id)
            return (
              <li
                key={c.id}
                onClick={() => !broadcastProgress?.isProcessing && toggle(c.id)}
                className={`flex items-center justify-between p-3 cursor-pointer 
                  hover:bg-hover ${sel ? 'bg-primary/10' : ''} 
                  ${broadcastProgress?.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatarUrl || '/avatar-placeholder.png'}
                    alt={c.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-foreground">{c.name}</p>
                    {c.phone && <p className="text-muted text-xs">{c.phone}</p>}
                  </div>
                </div>
                {sel && <CheckCircle className="text-primary w-5 h-5" />}
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Área de envio */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between bg-primary p-4 text-white">
          <Button variant="secondary" className="p-2" onClick={() => history.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">Enviar Broadcast</h1>
          <div className="w-8" />
        </header>

        {/* Progresso do Broadcast */}
        {broadcastProgress && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-600 w-5 h-5" />
                <div>
                  <h3 className="font-medium text-blue-900">Broadcast em andamento</h3>
                  <p className="text-sm text-blue-700">
                    {broadcastProgress.sent} enviados • {broadcastProgress.failed} falharam • {broadcastProgress.pending} pendentes
                  </p>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="flex-1 mx-4">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={stopBroadcast}
                className="text-red-600 hover:text-red-700"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                Parar
              </Button>
            </div>
            
            {broadcastProgress.estimatedTimeRemaining > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                Tempo estimado restante: {Math.ceil(broadcastProgress.estimatedTimeRemaining / 60)} minutos
              </p>
            )}
          </div>
        )}

        <Card className="m-4">
          <h2 className="font-medium">Instruções de Uso</h2>
          <ul className="mt-2 list-disc list-inside text-sm text-muted">
            <li>Clique nos contatos para selecioná-los.</li>
            <li>Escreva sua mensagem abaixo.</li>
            <li>Clique em "Enviar" para iniciar o broadcast.</li>
            <li>As mensagens serão enviadas de forma natural (com delays).</li>
            <li>Você pode acompanhar o progresso em tempo real.</li>
          </ul>
        </Card>

        {bodyContent}
      </main>
    </div>
  )
}
