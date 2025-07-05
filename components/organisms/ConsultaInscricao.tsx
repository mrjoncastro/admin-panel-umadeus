'use client'

import { useState } from 'react'
import { FormField, TextField, InputWithMask } from '@/components'
import { InscricaoWizard } from '@/components/organisms'
import { isValidCPF, isValidEmail } from '@/utils/validators'

interface ConsultaInscricaoProps {
  eventoId: string
  liderId?: string
  eventoAberto: boolean
}

interface InscricaoData {
  nome: string
  cpf: string
  email: string
  status: string
}

export default function ConsultaInscricao({
  eventoId,
  liderId,
  eventoAberto,
}: ConsultaInscricaoProps) {
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [inscricao, setInscricao] = useState<InscricaoData | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const cpfNum = cpf.replace(/\D/g, '')
    if (!isValidCPF(cpfNum)) {
      setError('CPF inválido.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setError('E-mail inválido.')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ cpf: cpfNum, email: email.trim() })
      const res = await fetch(`/api/inscricoes?${params.toString()}`)
      if (res.ok) {
        const data = (await res.json()) as InscricaoData
        setInscricao(data)
      } else if (res.status === 404) {
        if (eventoAberto) {
          setShowWizard(true)
        } else {
          setError('O período de inscrições foi encerrado.')
        }
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Erro ao consultar inscrição.')
      }
    } catch {
      setError('Erro ao consultar inscrição.')
    } finally {
      setLoading(false)
    }
  }

  if (showWizard) {
    return <InscricaoWizard eventoId={eventoId} liderId={liderId} />
  }

  if (inscricao) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Inscrição encontrada</h3>
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{inscricao.nome}</td>
              <td>{inscricao.cpf}</td>
              <td>{inscricao.email}</td>
              <td className="capitalize">{inscricao.status}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="CPF" htmlFor="consulta-cpf">
        <InputWithMask
          id="consulta-cpf"
          name="cpf"
          mask="cpf"
          required
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full"
        />
      </FormField>
      <FormField label="E-mail" htmlFor="consulta-email">
        <TextField
          id="consulta-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
      </FormField>
      {error && (
        <p role="alert" className="text-error-600">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        Inscrever
      </button>
    </form>
  )
}
