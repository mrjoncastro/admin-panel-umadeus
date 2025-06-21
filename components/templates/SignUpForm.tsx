'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import type { ClientResponseError } from 'pocketbase'
import Spinner from '@/components/atoms/Spinner'
import { FormField, TextField, InputWithMask } from '@/components'

const VIA_CEP_URL =
  process.env.NEXT_PUBLIC_VIA_CEP_URL || 'https://viacep.com.br/ws'

export default function SignUpForm({
  onSuccess,
  children,
}: {
  onSuccess?: () => void
  children?: React.ReactNode
}) {
  const { signUp } = useAuthContext()

  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [campo, setCampo] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaConfirm, setSenhaConfirm] = useState('')
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)

  // Busca os campos disponíveis
  useEffect(() => {
    async function loadCampos() {
      try {
        const resTenant = await fetch('/api/tenant')
        const data = resTenant.ok ? await resTenant.json() : { tenantId: null }
        const tenantId = data.tenantId

        if (!tenantId) return

        const res = await fetch('/api/campos')
        if (res.ok) {
          const data = await res.json()
          const lista = Array.isArray(data)
            ? data.map((item: { id: string; nome: string }) => ({
                id: item.id,
                nome: item.nome,
              }))
            : []
          setCampos(lista)
        }
      } catch {
        console.warn('Erro ao carregar os campos')
      }
    }

    loadCampos()
  }, [])

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return
    fetch(`${VIA_CEP_URL}/${cleanCep}/json/`)
      .then(async (res) => {
        if (!res.ok) {
          showError('CEP n\u00e3o encontrado.')
          setEndereco('')
          setCidade('')
          setEstado('')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data || data.erro) return
        setEndereco(data.logradouro || '')
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
      })
      .catch(() => {
        showError('Erro ao buscar o CEP.')
      })
  }, [cep, showError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== senhaConfirm) {
      showError('As senhas não coincidem.')
      return
    }

    if (!campo) {
      showError('Selecione um campo.')
      return
    }

    setLoading(true)
    try {
      await signUp(
        nome,
        email,
        telefone,
        cpf,
        dataNascimento,
        endereco,
        numero,
        estado,
        cep,
        cidade,
        senha,
      )
      showSuccess('Conta criada com sucesso!')
      setTimeout(() => {
        onSuccess?.()
      }, 500)
    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      const e = err as ClientResponseError
      const data = e.response?.data as
        | { telefone?: { message: string }; cpf?: { message: string } }
        | undefined
      const dupMsg = data?.telefone?.message || data?.cpf?.message
      if (dupMsg) {
        showError(dupMsg)
      } else {
        showError('Não foi possível criar a conta.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 bg-animated rounded-2xl backdrop-blur-md text-gray-200 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-white">
            Criar Conta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome completo" htmlFor="signup-nome">
              <TextField
                id="signup-nome"
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="E-mail" htmlFor="signup-email">
              <TextField
                id="signup-email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Telefone" htmlFor="signup-telefone">
              <InputWithMask
                id="signup-telefone"
                type="text"
                mask="telefone"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="CPF" htmlFor="signup-cpf">
              <InputWithMask
                id="signup-cpf"
                type="text"
                mask="cpf"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Data de nascimento" htmlFor="signup-data">
              <TextField
                id="signup-data"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <select
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              className="input-base w-full rounded-md px-4 py-2"
              required
            >
              <option value="">Selecione o campo</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <FormField label="CEP" htmlFor="signup-cep">
              <TextField
                id="signup-cep"
                type="text"
                placeholder="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Endereço" htmlFor="signup-endereco">
              <TextField
                id="signup-endereco"
                type="text"
                placeholder="Endereço"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Número" htmlFor="signup-numero">
              <TextField
                id="signup-numero"
                type="text"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Cidade" htmlFor="signup-cidade">
              <TextField
                id="signup-cidade"
                type="text"
                placeholder="Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Estado" htmlFor="signup-estado">
              <TextField
                id="signup-estado"
                type="text"
                placeholder="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Senha" htmlFor="signup-senha">
              <TextField
                id="signup-senha"
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
            <FormField label="Confirme a senha" htmlFor="signup-confirm">
              <TextField
                id="signup-confirm"
                type="password"
                placeholder="Confirme a senha"
                value={senhaConfirm}
                onChange={(e) => setSenhaConfirm(e.target.value)}
                className="w-full rounded-md px-4 py-2"
                required
              />
            </FormField>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full rounded-md py-2 text-white font-semibold ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" />
                Enviando...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>

          {children && (
            <div className="text-sm text-gray-300 text-center mt-4">
              {children}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
