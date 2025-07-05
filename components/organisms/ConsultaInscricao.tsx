'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import ModalAnimated from './ModalAnimated'
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
  const { user, isLoggedIn } = useAuthContext()
  const [cpf, setCpf] = useState(() =>
    isLoggedIn && user?.cpf ? user.cpf : '',
  )
  const [email, setEmail] = useState(() =>
    isLoggedIn && user?.email ? user.email : '',
  )
  const [errors, setErrors] = useState<{
    cpf?: string
    email?: string
    geral?: string
  }>({})
  const [inscricao, setInscricao] = useState<Inscricao | null>(null)
  const [loading, setLoading] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const searchParams = useSearchParams()
  const autoQueried = useRef(false)

  useEffect(() => {
    if (isLoggedIn && user) {
      setCpf(user.cpf ?? '')
      setEmail(user.email ?? '')
    }
  }, [isLoggedIn, user])

  const submitConsulta = useCallback(
    async (cpfVal: string, emailVal: string) => {
      const errs: { cpf?: string; email?: string } = {}
      if (!isValidCPF(cpfVal)) errs.cpf = 'CPF inválido'
      if (!isValidEmail(emailVal)) errs.email = 'E-mail inválido'
      setErrors(errs)
      if (Object.keys(errs).length > 0) return

      setLoading(true)
      try {
        const cleanCpf = cpfVal.replace(/\D/g, '')
        const existsParams = new URLSearchParams({
          cpf: cleanCpf,
          email: emailVal,
        })
        if (isLoggedIn && user) {
          existsParams.append('excludeId', user.id)
        }
        if (!isLoggedIn || (isLoggedIn && user)) {
          const existsRes = await fetch(
            `/api/usuarios/exists?${existsParams.toString()}`,
          )
          if (existsRes.ok) {
            const data = await existsRes.json()
            if (!isLoggedIn && (data.cpf || data.email)) {
              setShowLoginModal(true)
              return
            }
          }
        }

        const query = new URLSearchParams({
          cpf: cleanCpf,
          email: emailVal,
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
          if (isLoggedIn) {
            setShowWizard(true)
          } else if (inscricoesEncerradas) {
            setErrors({
              geral:
                'O período de inscrições foi encerrado e não há cadastro para as credenciais informadas.',
            })
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
    },
    [eventoId, inscricoesEncerradas, isLoggedIn, user],
  )

  useEffect(() => {
    if (
      autoQueried.current ||
      loading ||
      inscricao ||
      errors.cpf ||
      errors.email
    ) {
      return
    }

    const eventoParam = searchParams.get('evento')
    const cpfParam = searchParams.get('cpf')
    const emailParam = searchParams.get('email')
    if (eventoParam === eventoId && cpfParam && emailParam) {
      autoQueried.current = true
      if (isLoggedIn && user) {
        submitConsulta(user.cpf ?? '', user.email ?? '')
      } else {
        setCpf(cpfParam)
        setEmail(emailParam)
        submitConsulta(cpfParam, emailParam)
      }
    }
  }, [
    eventoId,
    searchParams,
    loading,
    inscricao,
    errors,
    submitConsulta,
    isLoggedIn,
    user,
  ])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await submitConsulta(cpf, email)
  }

  if (showWizard) {
    return (
      <EventForm
        eventoId={eventoId}
        liderId={liderId}
        initialCpf={cpf}
        initialEmail={email}
      />
    )
  }

  return (
    <div className="space-y-4 mx-auto max-w-xs md:max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="CPF" htmlFor="consulta-cpf" error={errors.cpf}>
            <InputWithMask
              id="consulta-cpf"
              mask="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              disabled={isLoggedIn}
              required
            />
          </FormField>
          <FormField label="E-mail" htmlFor="consulta-email" error={errors.email}>
            <TextField
              id="consulta-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoggedIn}
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

      {inscricao && (
        <InscricoesTable inscricoes={[inscricao]} variant="details" />
      )}

      <ModalAnimated open={showLoginModal} onOpenChange={setShowLoginModal}>
        <div className="space-y-4 text-center w-72">
          <Dialog.Title asChild>
            <h3 className="text-lg font-semibold">Conta já existente</h3>
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Conta já cadastrada
          </Dialog.Description>
          <p>
            Já existe uma conta com este CPF e/ou e-mail. Por favor, faça login
            para continuar.
          </p>
          <Link
            href={`/login?redirectTo=/inscricoes?evento=${eventoId}&cpf=${cpf.replace(/\D/g, '')}&email=${encodeURIComponent(email)}`}
            className="btn btn-primary inline-block"
            onClick={() => setShowLoginModal(false)}
          >
            Fazer Login
          </Link>
        </div>
      </ModalAnimated>
    </div>
  )
}
