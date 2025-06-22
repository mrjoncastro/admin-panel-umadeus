'use client'

import React, { useEffect, useState } from 'react'
import { useTenant } from '@/lib/context/TenantContext'
import { useToast } from '@/lib/context/ToastContext'
import { useRouter } from 'next/navigation'
import FormWizard from './FormWizard'
import LoadingOverlay from './LoadingOverlay'
import { FormField, InputWithMask, TextField } from '@/components'

interface Produto {
  id: string
  nome: string
  tamanhos?: string[]
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
    estado: '',
    cidade: '',
    numero: '',
    campoId: '',
    produtoId: '',
    tamanho: '',
    password: '',
    passwordConfirm: '',
    paymentMethod: 'pix',
    installments: 1,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setFetching(true)
      try {
        const promises: Promise<Response>[] = [
          fetch(`/api/eventos/${eventoId}`),
        ]
        if (liderId) {
          promises.unshift(fetch(`/api/lider/${liderId}`))
        } else {
          promises.unshift(fetch('/api/campos'))
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
        const lista = Array.isArray(eventoData?.expand?.produtos)
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (eventoData.expand.produtos as any[]).map((p) => ({
              id: p.id,
              nome: p.nome,
              tamanhos: Array.isArray(p.tamanhos)
                ? p.tamanhos
                : p.tamanhos
                  ? [p.tamanhos]
                  : undefined,
            }))
          : []
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
  }, [eventoId, liderId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (!liderId && form.password !== form.passwordConfirm) {
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
            estado: form.estado,
            cidade: form.cidade,
            numero: form.numero,
            produtoId: form.produtoId,
            tamanho: form.tamanho,
            liderId,
            eventoId,
            paymentMethod: form.paymentMethod,
            installments: form.installments,
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
            user_state: form.estado,
            user_city: form.cidade,
            user_number: form.numero,
            campo: form.campoId,
            evento: eventoId,
            produtoId: form.produtoId,
            tamanho: form.tamanho,
            password: form.password,
            passwordConfirm: form.passwordConfirm,
            paymentMethod: form.paymentMethod,
            installments: form.installments,
          }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <FormField label="E-mail" htmlFor="email">
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
          <FormField label="CPF" htmlFor="cpf">
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
          <select
            id="produtoId"
            name="produtoId"
            value={form.produtoId}
            onChange={handleChange}
            className="input-base"
          >
            {produtos.length === 0 ? (
              <option value="">Nenhum produto disponível</option>
            ) : (
              produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))
            )}
          </select>
        </FormField>
        {produtos.find((p) => p.id === form.produtoId)?.tamanhos && (
          <FormField label="Tamanho" htmlFor="tamanho">
            <select
              id="tamanho"
              name="tamanho"
              value={form.tamanho}
              onChange={handleChange}
              className="input-base"
            >
              <option value="">Selecione</option>
              {produtos
                .find((p) => p.id === form.produtoId)
                ?.tamanhos?.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
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
            >
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="credito">Crédito</option>
            </select>
          </FormField>
          <FormField label="Parcelas" htmlFor="installments">
            <select
              id="installments"
              name="installments"
              value={form.installments}
              onChange={handleChange}
              disabled={form.paymentMethod !== 'credito'}
              className="input-base"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}x
                </option>
              ))}
            </select>
          </FormField>
        </div>
      ),
    })
  }

  if (!liderId) {
    steps.push({
      title: 'Criar Senha',
      content: (
        <div className="space-y-4">
          <FormField label="Senha" htmlFor="password">
            <TextField
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Confirme a Senha" htmlFor="passwordConfirm">
            <TextField
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
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

  return (
    <FormWizard
      steps={steps}
      onFinish={handleSubmit}
      loading={loading}
      className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
    />
  )
}
