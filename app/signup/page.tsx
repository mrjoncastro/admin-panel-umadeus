'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import {
  TextField,
  InputWithMask,
  FormField,
  PasswordField,
  Button,
  Spinner,
} from '@/components'
import { LayoutWrapper } from '@/components/templates'

export default function SignUpPage() {
  const { login } = useAuthContext()
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaConfirm, setSenhaConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; cpf?: string }>({})

  async function checkExists() {
    const params = new URLSearchParams()
    if (email) params.append('email', email)
    if (cpf) params.append('cpf', cpf.replace(/\D/g, ''))
    if ([...params].length === 0) return {}
    const res = await fetch(`/api/usuarios/exists?${params.toString()}`)
    if (!res.ok) return {}
    const data = await res.json()
    const errs: { email?: string; cpf?: string } = {}
    if (data.email) errs.email = 'E-mail já cadastrado'
    if (data.cpf) errs.cpf = 'CPF já cadastrado'
    setErrors(errs)
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha.length < 8) {
      showError('A senha deve ter ao menos 8 caracteres.')
      return
    }

    if (senha !== senhaConfirm) {
      showError('As senhas não coincidem.')
      return
    }

    const dup = await checkExists()
    if (dup.email || dup.cpf) return

    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, cpf, senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          await checkExists()
        }
        const dupMsg =
          data?.telefone?.message || data?.cpf?.message || data?.email?.message
        showError(dupMsg || data?.error || 'Erro ao criar conta.')
        return
      }
      await login(email, senha)
      showSuccess('Conta criada com sucesso!')
      router.push('/completar-cadastro')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Falha de conexão')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-[var(--accent)]">
          Criar Conta
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome completo" htmlFor="signup-nome">
            <TextField
              id="signup-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </FormField>
          <FormField label="E-mail" htmlFor="signup-email" error={errors.email}>
            <TextField
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((err) => ({ ...err, email: undefined }))
              }}
              required
            />
          </FormField>
          <FormField label="Telefone" htmlFor="signup-telefone">
            <InputWithMask
              id="signup-telefone"
              mask="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </FormField>
          <FormField label="CPF" htmlFor="signup-cpf" error={errors.cpf}>
            <InputWithMask
              id="signup-cpf"
              mask="cpf"
              value={cpf}
              onChange={(e) => {
                setCpf(e.target.value)
                setErrors((err) => ({ ...err, cpf: undefined }))
              }}
              required
            />
          </FormField>
          <FormField label="Senha" htmlFor="signup-senha">
            <PasswordField
              id="signup-senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Confirme a senha" htmlFor="signup-confirm">
            <PasswordField
              id="signup-confirm"
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" /> Enviando...
              </span>
            ) : (
              'Avançar'
            )}
          </Button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Já possui conta?{' '}
            <a
              href="/login"
              className="underline hover:text-[var(--accent)] transition"
            >
              Fazer login
            </a>
          </p>
        </form>
      </div>
    </LayoutWrapper>
  )
}
