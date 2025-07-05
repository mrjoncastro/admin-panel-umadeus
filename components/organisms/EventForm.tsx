'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useTenant } from '@/lib/context/TenantContext'
import { useToast } from '@/lib/context/ToastContext'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { fetchCep } from '@/utils/cep'
import { isValidCPF, isValidEmail } from '@/utils/validators'
import FormWizard from './FormWizard'
import LoadingOverlay from './LoadingOverlay'
import InscricoesTable from '@/app/cliente/components/InscricoesTable'
import type { Inscricao } from '@/types'
import {
  FormField,
  InputWithMask,
  TextField,
  PasswordField,
} from '@/components'

interface Produto {
  id: string
  nome: string
  preco?: number
  preco_bruto?: number
  imagemUrl?: string
  tamanhos?: string[]
}

interface ProdutoApi {
  id: string
  nome: string
  preco?: number
  preco_bruto?: number
  imagemUrl?: string
  imagem_url?: string
  tamanhos?: string[] | string
}

interface Campo {
  id: string
  nome: string
}

export interface EventFormProps {
  eventoId: string
  liderId?: string
}

export default function EventForm({ eventoId, liderId }: EventFormProps) {
  const { config } = useTenant()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const { isLoggedIn, user } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])
  const [campoNome, setCampoNome] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cobraInscricao, setCobraInscricao] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    data_nascimento: '',
    genero: '',
    cep: '',
    endereco: '',
    bairro: '',
    estado: '',
    cidade: '',
    numero: '',
    campoId: '',
    produtoId: '',
    tamanho: '',
    role: 'usuario',
    password: '',
    passwordConfirm: '',
    paymentMethod: 'pix',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{ cpf?: string; email?: string }>({})
  const [pendentes, setPendentes] = useState<Inscricao[]>([])
  const [checouPendentes, setChecouPendentes] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setFetching(true)
      try {
        const headers = getAuthHeaders(pb)
        const promises: Promise<Response>[] = [
          fetch(`/api/eventos/${eventoId}`, { headers, credentials: 'include' }),
        ]
        if (liderId) {
          promises.unshift(fetch(`/api/lider/${liderId}`, { headers, credentials: 'include' }))
        } else {
          promises.unshift(fetch('/api/campos', { headers, credentials: 'include' }))
        }
        const [campoRes, eventoRes] = await Promise.all(promises)
        if (liderId) {
          const data = campoRes.ok ? await campoRes.json() : null
          setCampoNome(data?.campo || '')
        } else {
          const camposData = campoRes.ok ? await campoRes.json() : []
          setCampos(Array.isArray(camposData) ? camposData : [])
        }
        const eventoData = eventoRes.ok ? await eventoRes.json() : null
        setCobraInscricao(Boolean(eventoData?.cobra_inscricao))
        let lista: Produto[] = []
        if (Array.isArray(eventoData?.expand?.produtos)) {
          lista = (eventoData.expand.produtos as ProdutoApi[]).map((p) => ({
            id: p.id,
            nome: p.nome,
            preco: p.preco,
            preco_bruto: p.preco_bruto,
            imagemUrl: p.imagemUrl || p.imagem_url,
            tamanhos: Array.isArray(p.tamanhos)
              ? p.tamanhos
              : p.tamanhos
              ? [p.tamanhos]
              : undefined,
          }))
        } else if (eventoData?.expand?.produto_inscricao) {
          const p = eventoData.expand.produto_inscricao as ProdutoApi
          lista = [
            {
              id: p.id,
              nome: p.nome,
              preco: p.preco,
              preco_bruto: p.preco_bruto,
              imagemUrl: p.imagemUrl || p.imagem_url,
              tamanhos: Array.isArray(p.tamanhos)
                ? p.tamanhos
                : p.tamanhos
                ? [p.tamanhos]
                : undefined,
            },
          ]
        } else if (eventoData?.produto_inscricao) {
          lista = [{ id: eventoData.produto_inscricao, nome: 'Produto' }]
        }
        setProdutos(lista)
        if (lista.length > 0) {
          setForm((prev) => ({ ...prev, produtoId: lista[0].id }))
        }
      } catch {
        setCampoNome('')
        setCampos([])
        setProdutos([])
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [eventoId, liderId, pb])

  useEffect(() => {
    if (isLoggedIn && user) {
      const nasc = String(user.data_nascimento ?? '')
      setForm((prev) => ({
        ...prev,
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cpf: user.cpf || '',
        data_nascimento: nasc ? nasc.split(' ')[0] : '',
        genero: (user as Record<string, string>).genero || '',
        cep: user.cep || '',
        endereco: user.endereco || '',
        bairro: user.bairro || '',
        estado: user.estado || '',
        cidade: user.cidade || '',
        numero: user.numero || '',
        role: 'usuario',
        campoId: (user.campo as string) || prev.campoId,
      }))
    }
  }, [isLoggedIn, user])

  useEffect(() => {
    async function verificarPendentes() {
      if (!isLoggedIn || !user) {
        setChecouPendentes(true)
        return
      }
      try {
        const headers = getAuthHeaders(pb)
        const res = await fetch(
          `/api/inscricoes?status=pendente&evento=${eventoId}`,
          { headers, credentials: 'include' },
        )
        if (res.ok) {
          const data = await res.json()
          const items = Array.isArray(data)
            ? data
            : Array.isArray(data.items)
              ? (data.items as Inscricao[])
              : []
          setPendentes(items)
        } else {
          setPendentes([])
        }
      } catch {
        setPendentes([])
      } finally {
        setChecouPendentes(true)
      }
    }
    verificarPendentes()
  }, [isLoggedIn, user, eventoId, pb])

  useEffect(() => {
    async function lookup() {
      const data = await fetchCep(form.cep).catch(() => null)
      if (!data) {
        showError('CEP n\u00e3o encontrado.')
        setForm((prev) => ({
          ...prev,
          endereco: '',
          bairro: '',
          cidade: '',
          estado: '',
        }))
        return
      }
      setForm((prev) => ({
        ...prev,
        endereco: data.street,
        bairro: data.neighborhood,
        cidade: data.city,
        estado: data.state,
      }))
    }
    if (form.cep.replace(/\D/g, '').length === 8) lookup()
  }, [form.cep, showError])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'cpf' || name === 'email') {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectProduto = (id: string) => {
    setForm((prev) => ({ ...prev, produtoId: id, tamanho: '' }))
  }

  const handleStepValidate = async (index: number) => {
    if (index === 0) {
      setFieldErrors({})
      const cpfNumerico = form.cpf.replace(/\D/g, '')
      if (!isValidCPF(cpfNumerico)) {
        setFieldErrors({ cpf: 'CPF inválido.' })
        return false
      }
      if (!isValidEmail(form.email)) {
        setFieldErrors({ email: 'E-mail inválido.' })
        return false
      }
      try {
        const query =
          `/api/usuarios/exists?cpf=${cpfNumerico}&email=${encodeURIComponent(form.email)}${
            isLoggedIn && user ? `&excludeId=${user.id}` : ''
          }`
        const res = await fetch(query)
        if (res.ok) {
          const data = await res.json()
          if (data.cpf) {
            setFieldErrors((prev) => ({ ...prev, cpf: 'CPF já cadastrado.' }))
            return false
          }
          if (data.email) {
            setFieldErrors((prev) => ({ ...prev, email: 'E-mail já cadastrado.' }))
            return false
          }
        }
      } catch {
        /* ignore */
      }
    }
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (!liderId && !isLoggedIn && form.password.length < 8) {
        showError('A senha deve ter ao menos 8 caracteres.')
        setLoading(false)
        return
      }
      if (!liderId && !isLoggedIn && form.password !== form.passwordConfirm) {
        showError('As senhas não coincidem.')
        setLoading(false)
        return
      }
      const url = liderId ? '/api/inscricoes' : '/loja/api/inscricoes'
      const [firstName, ...rest] = form.nome.split(' ')
      const payload = liderId
        ? {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            cpf: form.cpf,
            data_nascimento: form.data_nascimento,
            genero: form.genero,
            cep: form.cep,
            endereco: form.endereco,
            bairro: form.bairro,
            estado: form.estado,
            cidade: form.cidade,
            numero: form.numero,
            role: form.role,
            produtoId: form.produtoId,
            tamanho: form.tamanho,
            liderId,
            eventoId,
            paymentMethod: form.paymentMethod,
          }
        : {
            user_first_name: firstName,
            user_last_name: rest.join(' '),
            user_email: form.email,
            user_phone: form.telefone,
            user_cpf: form.cpf,
            user_birth_date: form.data_nascimento,
            user_gender: form.genero,
            user_cep: form.cep,
            user_address: form.endereco,
            user_neighborhood: form.bairro,
            user_state: form.estado,
            user_city: form.cidade,
            user_number: form.numero,
            campo: form.campoId,
            evento: eventoId,
            produtoId: form.produtoId,
            tamanho: form.tamanho,
            ...(isLoggedIn
              ? {}
              : {
                  password: form.password,
                  passwordConfirm: form.passwordConfirm,
                  role: form.role,
                }),
            paymentMethod: form.paymentMethod,
          }
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        showError(data.erro || data.error || 'Erro ao enviar inscrição.')
        return
      }
      showSuccess('Inscrição enviada com sucesso!')
      setTimeout(() => {
        router.push('/inscricoes/obrigado')
      }, 500)
    } catch {
      showError('Erro ao enviar inscrição.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: 'Dados Pessoais',
      content: (
        <div className="space-y-4">
          <FormField label="Nome" htmlFor="nome">
            <TextField
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="E-mail" htmlFor="email" error={fieldErrors.email}>
            <TextField
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Telefone" htmlFor="telefone">
            <InputWithMask
              id="telefone"
              name="telefone"
              mask="telefone"
              value={form.telefone}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="CPF" htmlFor="cpf" error={fieldErrors.cpf}>
            <InputWithMask
              id="cpf"
              name="cpf"
              mask="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Data de Nascimento" htmlFor="data_nascimento">
            <TextField
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              value={form.data_nascimento}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Gênero" htmlFor="genero">
            <select
              id="genero"
              name="genero"
              value={form.genero}
              onChange={handleChange}
              className="input-base"
              required
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </FormField>
        </div>
      ),
    },
    {
      title: 'Endereço',
      content: (
        <div className="space-y-4">
          <FormField label="CEP" htmlFor="cep">
            <TextField
              id="cep"
              name="cep"
              value={form.cep}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Endereço" htmlFor="endereco">
            <TextField
              id="endereco"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Estado" htmlFor="estado">
            <TextField
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Cidade" htmlFor="cidade">
            <TextField
              id="cidade"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Bairro" htmlFor="bairro">
            <TextField
              id="bairro"
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Número" htmlFor="numero">
            <TextField
              id="numero"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>
      ),
    },
  ]

  if (liderId) {
    steps.push({
      title: 'Campo',
      content: (
        <div className="p-4 text-center">
          {campoNome ? (
            <p>{campoNome}</p>
          ) : (
            <LoadingOverlay show={true} text="Carregando..." />
          )}
        </div>
      ),
    })
  } else {
    steps.push({
      title: 'Campo de Atuação',
      content: (
        <div className="space-y-4">
          <FormField label="Campo" htmlFor="campoId">
            <select
              id="campoId"
              name="campoId"
              value={form.campoId}
              onChange={handleChange}
              className="input-base"
              required
            >
              <option value="">Selecione</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      ),
    })
  }

  steps.push({
    title: 'Produto',
    content: (
      <div className="space-y-4">
        <FormField label="Produto" htmlFor="produtoId">
          <input
            type="hidden"
            id="produtoId"
            name="produtoId"
            value={form.produtoId}
            required={produtos.length > 0}
          />
          <div className="flex flex-wrap gap-3">
            {produtos.length === 0 ? (
              <p className="text-sm">Nenhum produto disponível</p>
            ) : (
              produtos.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectProduto(p.id)}
                  aria-pressed={form.produtoId === p.id}
                  className={`border rounded-md p-2 text-left flex flex-col items-center w-32 focus:outline-none ${form.produtoId === p.id ? 'ring-2 ring-[var(--accent)]' : ''}`}
                >
                  {p.imagemUrl && (
                    <Image
                      src={p.imagemUrl}
                      alt={p.nome}
                      width={80}
                      height={80}
                      className="mb-1 rounded object-cover"
                    />
                  )}
                  <span className="text-xs font-medium text-center line-clamp-2">
                    {p.nome}
                  </span>
                  {typeof p.preco_bruto === 'number' && (
                    <span className="text-xs font-semibold">
                      R$ {p.preco_bruto.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </FormField>
        {produtos.find((p) => p.id === form.produtoId)?.tamanhos && (
          <FormField label="Tamanho" htmlFor="tamanho">
            <input
              type="hidden"
              id="tamanho"
              name="tamanho"
              value={form.tamanho}
              required={(produtos.find((p) => p.id === form.produtoId)?.tamanhos?.length ?? 0) > 0}
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {produtos
                .find((p) => p.id === form.produtoId)
                ?.tamanhos?.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setForm((prev) => ({ ...prev, tamanho: t }))}
                    aria-pressed={form.tamanho === t}
                    className={`px-3 py-1 border rounded text-sm focus:outline-none ${form.tamanho === t ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}
                  >
                    {t}
                  </button>
                ))}
            </div>
          </FormField>
        )}
      </div>
    ),
  })

  if (cobraInscricao) {
    steps.push({
      title: 'Forma de Pagamento',
      content: (
        <div className="space-y-4">
          <FormField label="Forma de Pagamento" htmlFor="paymentMethod">
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="input-base"
              required
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
            </select>
          </FormField>
          
        </div>
      ),
    })
  }

  if (!liderId && !isLoggedIn) {
    steps.push({
      title: 'Criar Senha',
      content: (
        <div className="space-y-4">
          <FormField label="Senha" htmlFor="password">
            <PasswordField
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Confirme a Senha" htmlFor="passwordConfirm">
            <PasswordField
              id="passwordConfirm"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>
      ),
    })
  }

  steps.push({
    title: 'Confirmação',
    content: (
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" required /> Eu aceito os termos
        </label>
        {config.confirmaInscricoes && (
          <p className="text-sm text-neutral-600">
            Sua inscrição será analisada e confirmada pela liderança.
          </p>
        )}
      </div>
    ),
  })

  if (fetching) {
    return <LoadingOverlay show={true} text="Carregando..." />
  }

  if (checouPendentes && pendentes.length > 0) {
    return (
      <InscricoesTable inscricoes={pendentes} variant="details" />
    )
  }

  return (
    <FormWizard
      steps={steps}
      onFinish={handleSubmit}
      onStepValidate={handleStepValidate}
      loading={loading}
      className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
    />
  )
}
