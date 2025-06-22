'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, FormField, TextField, Spinner } from '@/components'
import { useToast } from '@/lib/context/ToastContext'

interface EventFormProps {
  defaultLeaderId?: string
}

export default function EventForm({ defaultLeaderId }: EventFormProps) {
  const searchParams = useSearchParams()
  const { showError, showSuccess } = useToast()
  const leaderId = defaultLeaderId || searchParams.get('lider') || ''
  const [leader, setLeader] = useState<{ name: string } | null>(null)
  const [loadingLeader, setLoadingLeader] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!leaderId) return
    setLoadingLeader(true)
    fetch(`/api/lideres/${leaderId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao carregar líder')
        return res.json()
      })
      .then((data) => {
        setLeader({ name: data.name ?? data.nome ?? '' })
      })
      .catch(() => {
        showError('Erro ao carregar líder.')
      })
      .finally(() => setLoadingLeader(false))
  }, [leaderId, showError])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/eventos/cadastrar', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Erro ao enviar formulário')
      showSuccess('Inscrição enviada com sucesso!')
      e.currentTarget.reset()
    } catch {
      showError('Falha ao enviar inscrição.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {loadingLeader ? (
        <div className="flex justify-center">
          <Spinner className="w-5 h-5" />
        </div>
      ) : leader ? (
        <FormField label="Líder" htmlFor="leader-name">
          <TextField id="leader-name" readOnly value={leader.name} />
        </FormField>
      ) : null}

      <input type="hidden" name="leaderId" value={leaderId} />

      <FormField label="Nome do Participante" htmlFor="participant-name">
        <TextField id="participant-name" name="participantName" required />
      </FormField>

      {/* TODO: outros campos */}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner className="w-4 h-4" /> Enviando...
          </span>
        ) : (
          'Enviar'
        )}
      </Button>
    </form>
  )
}
