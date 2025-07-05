'use client'
import { useState } from 'react'
import EventForm from './EventForm'
import InscricoesTable from '@/app/cliente/components/InscricoesTable'
import { FormField, InputWithMask, TextField } from '@/components'
import { Button } from '@/components/ui/button'
import type { Inscricao } from '@/types'
import { isValidCPF, isValidEmail } from '@/utils/validators'

interface ConsultaInscricaoProps {
  eventoId: string
  liderId?: string
  inscricoesEncerradas: boolean
}

export default function ConsultaInscricao({
  eventoId,
  liderId,
  inscricoesEncerradas,
}: ConsultaInscricaoProps) {
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ cpf?: string; email?: string; geral?: string }>({})
  const [inscricao, setInscricao] = useState<Inscricao | null>(null)
  const [loading, setLoading] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: { cpf?: string; email?: string } = {}
    if (!isValidCPF(cpf)) errs.cpf = 'CPF inválido'
    if (!isValidEmail(email)) errs.email = 'E-mail inválido'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const query = new URLSearchParams({
        cpf: cpf.replace(/\D/g, ''),
        email,
        evento: eventoId,
      })
      const res = await fetch(`/api/inscricoes/public?${query.toString()}`)
      if (res.status === 200) {
        const data = await res.json()
        const item = Array.isArray(data) ? data[0] : data
        setInscricao(item)
        setShowWizard(false)
        setErrors({})
      } else if (res.status === 404) {
        if (inscricoesEncerradas) {
          setErrors({ geral: 'O período de inscrições foi encerrado...' })
        } else {
          setShowWizard(true)
        }
        setInscricao(null)
      } else {
        setErrors({ geral: 'Erro ao consultar inscrição.' })
        setInscricao(null)
      }
    } catch {
      setErrors({ geral: 'Erro ao consultar inscrição.' })
      setInscricao(null)
    } finally {
      setLoading(false)
    }
  }

  if (showWizard) {
    return <EventForm eventoId={eventoId} liderId={liderId} />
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="CPF" htmlFor="consulta-cpf" error={errors.cpf}>
          <InputWithMask
            id="consulta-cpf"
            mask="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
        </FormField>
        <FormField label="E-mail" htmlFor="consulta-email" error={errors.email}>
          <TextField
            id="consulta-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>
        {errors.geral && (
          <p role="alert" className="text-error-600">
            {errors.geral}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          Avançar
        </Button>
      </form>

      {inscricao && <InscricoesTable inscricoes={[inscricao]} variant="details" />}
    </div>
  )
}
