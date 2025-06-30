'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { fetchCep } from '@/utils/cep'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import type { ClientResponseError } from 'pocketbase'
import Spinner from '@/components/atoms/Spinner'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import {
  FormField,
  TextField,
  InputWithMask,
  PasswordField,
} from '@/components'

const schema = yup.object({
  nome: yup.string().required('O nome é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('O e-mail é obrigatório'),
  telefone: yup.string().required('O telefone é obrigatório'),
  cpf: yup.string().required('O CPF é obrigatório'),
  data_nascimento: yup
    .string()
    .required('A data de nascimento é obrigatória'),
  campo: yup.string().required('O campo é obrigatório'),
  cep: yup.string().required('O CEP é obrigatório'),
  endereco: yup.string().required('O endereço é obrigatório'),
  numero: yup.string().required('O número é obrigatório'),
  bairro: yup.string().required('O bairro é obrigatório'),
  cidade: yup.string().required('A cidade é obrigatória'),
  estado: yup.string().required('O estado é obrigatório'),
  senha: yup.string().required('A senha é obrigatória'),
})

type FormData = yup.InferType<typeof schema>

export default function SignUpForm({
  onSuccess,
  children,
}: {
  onSuccess?: () => void
  children?: React.ReactNode
}) {
  const { signUp } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])

  const [campos, setCampos] = useState<{ id: string; nome: string }[]>([])
  const [senhaConfirm, setSenhaConfirm] = useState('')

  const {
    register,
    handleSubmit: submitForm,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) })

  const cep = watch('cep')
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(false)

  // Busca os campos disponíveis
  useEffect(() => {
    async function loadCampos() {
      try {
        const resTenant = await fetch('/api/tenant', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
        const data = resTenant.ok ? await resTenant.json() : { tenantId: null }
        const tenantId = data.tenantId

        if (!tenantId) return

        const res = await fetch('/api/campos', {
          headers: getAuthHeaders(pb),
          credentials: 'include',
        })
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
  }, [pb])

  useEffect(() => {
    async function lookup() {
      const data = await fetchCep(cep).catch(() => null)
      if (!data) {
        showError('CEP n\u00e3o encontrado.')
        setValue('endereco', '')
        setValue('cidade', '')
        setValue('estado', '')
        setValue('bairro', '')
        return
      }
      setValue('endereco', data.street)
      setValue('cidade', data.city)
      setValue('estado', data.state)
      setValue('bairro', data.neighborhood)
    }
    if (cep && cep.replace(/\D/g, '').length === 8) lookup()
  }, [cep, setValue, showError])

  const onSubmit = submitForm(async (data) => {
    if (data.senha !== senhaConfirm) {
      showError('As senhas não coincidem.')
      return
    }

    if (!data.campo) {
      showError('Selecione um campo.')
      return
    }

    setLoading(true)
    try {
      await signUp(
        data.nome,
        data.email,
        data.telefone,
        data.cpf,
        data.data_nascimento,
        data.endereco,
        data.numero,
        data.bairro,
        data.estado,
        data.cep,
        data.cidade,
        data.senha,
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
  })

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 bg-animated rounded-2xl backdrop-blur-md text-gray-200 shadow-lg">
        <form onSubmit={onSubmit} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-white">
            Criar Conta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nome completo"
              htmlFor="signup-nome"
              error={errors.nome?.message}
            >
              <TextField
                id="signup-nome"
                type="text"
                placeholder="Nome completo"
                className="w-full rounded-md px-4 py-2"
                {...register('nome')}
              />
            </FormField>
            <FormField
              label="E-mail"
              htmlFor="signup-email"
              error={errors.email?.message}
            >
              <TextField
                id="signup-email"
                type="email"
                placeholder="E-mail"
                className="w-full rounded-md px-4 py-2"
                {...register('email')}
              />
            </FormField>
            <FormField
              label="Telefone"
              htmlFor="signup-telefone"
              error={errors.telefone?.message}
            >
              <InputWithMask
                id="signup-telefone"
                type="text"
                mask="telefone"
                placeholder="Telefone"
                className="w-full rounded-md px-4 py-2"
                {...register('telefone')}
              />
            </FormField>
            <FormField
              label="CPF"
              htmlFor="signup-cpf"
              error={errors.cpf?.message}
            >
              <InputWithMask
                id="signup-cpf"
                type="text"
                mask="cpf"
                placeholder="CPF"
                className="w-full rounded-md px-4 py-2"
                {...register('cpf')}
              />
            </FormField>
            <FormField
              label="Data de nascimento"
              htmlFor="signup-data"
              error={errors.data_nascimento?.message}
            >
              <TextField
                id="signup-data"
                type="date"
                className="w-full rounded-md px-4 py-2"
                {...register('data_nascimento')}
              />
            </FormField>
            <select
              className="input-base w-full rounded-md px-4 py-2"
              {...register('campo')}
            >
              <option value="">Selecione o campo</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {errors.campo && (
              <span role="alert" className="text-sm text-error-600">
                {errors.campo.message}
              </span>
            )}
            <FormField
              label="CEP"
              htmlFor="signup-cep"
              error={errors.cep?.message}
            >
              <TextField
                id="signup-cep"
                type="text"
                placeholder="CEP"
                className="w-full rounded-md px-4 py-2"
                {...register('cep')}
              />
            </FormField>
            <FormField
              label="Endereço"
              htmlFor="signup-endereco"
              error={errors.endereco?.message}
            >
              <TextField
                id="signup-endereco"
                type="text"
                placeholder="Endereço"
                className="w-full rounded-md px-4 py-2"
                {...register('endereco')}
              />
            </FormField>
            <FormField
              label="Número"
              htmlFor="signup-numero"
              error={errors.numero?.message}
            >
              <TextField
                id="signup-numero"
                type="text"
                placeholder="Número"
                className="w-full rounded-md px-4 py-2"
                {...register('numero')}
              />
            </FormField>
            <FormField
              label="Bairro"
              htmlFor="signup-bairro"
              error={errors.bairro?.message}
            >
              <TextField
                id="signup-bairro"
                type="text"
                placeholder="Bairro"
                className="w-full rounded-md px-4 py-2"
                {...register('bairro')}
              />
            </FormField>
            <FormField
              label="Cidade"
              htmlFor="signup-cidade"
              error={errors.cidade?.message}
            >
              <TextField
                id="signup-cidade"
                type="text"
                placeholder="Cidade"
                className="w-full rounded-md px-4 py-2"
                {...register('cidade')}
              />
            </FormField>
            <FormField
              label="Estado"
              htmlFor="signup-estado"
              error={errors.estado?.message}
            >
              <TextField
                id="signup-estado"
                type="text"
                placeholder="Estado"
                className="w-full rounded-md px-4 py-2"
                {...register('estado')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Senha"
              htmlFor="signup-senha"
              error={errors.senha?.message}
            >
              <PasswordField
                id="signup-senha"
                placeholder="Senha"
                className="w-full rounded-md px-4 py-2"
                {...register('senha')}
              />
            </FormField>
            <FormField label="Confirme a senha" htmlFor="signup-confirm">
              <PasswordField
                id="signup-confirm"
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
