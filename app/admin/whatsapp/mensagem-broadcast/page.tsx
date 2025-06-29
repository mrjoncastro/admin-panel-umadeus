'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, X } from 'lucide-react'
import { useAuthGuard } from '../lib/hooks/useAuthGuard'
import { useToast } from '../lib/context/ToastContext'
import { Card } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'

type Role = 'lider' | 'usuario' | 'todos'
interface Contact {
  id: string
  name: string
  phone?: string
  avatarUrl?: string
}

export default function MensagemBroadcastPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  const { showSuccess, showError } = useToast()
  const [role, setRole] = useState<Role>('todos')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
      showSuccess(`✅ ${data.success} enviados • ❌ ${data.failed} falharam`)
      setMessage('')
      setSelected(new Set())
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="flex h-screen bg-background">
      {/* Lista de contatos */}
      <aside className="w-80 bg-card border-r border-border overflow-auto">
        <div className="p-4">
          <Input
            as="select"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading}
          >
            <option value="todos">Todos</option>
            <option value="lider">Líderes</option>
            <option value="usuario">Usuários</option>
          </Input>
        </div>
        <ul>
          {contacts.map((c) => {
            const sel = selected.has(c.id)
            return (
              <li
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex items-center justify-between p-3 cursor-pointer 
                  hover:bg-hover ${sel ? 'bg-primary/10' : ''}`}
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
          <Button variant="ghost" size="icon" onClick={() => history.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">Enviar Broadcast</h1>
          <div className="w-8" />
        </header>

        <Card className="m-4">
          <h2 className="font-medium">Instruções de Uso</h2>
          <ul className="mt-2 list-disc list-inside text-sm text-muted">
            <li>Clique nos contatos para selecioná-los.</li>
            <li>Escreva sua mensagem abaixo.</li>
            <li>Clique em “Enviar” para disparar o broadcast.</li>
            <li>Mensagens serão enviadas apenas aos selecionados.</li>
          </ul>
        </Card>

        {!selected.size ? (
          <div className="flex-1 flex items-center justify-center text-muted">
            Selecione ao menos um contato
          </div>
        ) : (
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
                      variant="ghost"
                      size="icon"
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
        )}
      </main>
    </div>
  )
}
