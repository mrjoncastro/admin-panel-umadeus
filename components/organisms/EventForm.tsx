'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { useTenant } from '@/lib/context/TenantContext'
import { useToast } from '@/lib/context/ToastContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { buildInscricaoPayload } from '@/utils/buildInscricaoPayload'
import FormWizard from './FormWizard'
import LoadingOverlay from './LoadingOverlay'
import InscricoesTable from '@/app/cliente/components/InscricoesTable'
import type { Inscricao } from '@/types'
import { FormField } from '@/components'
import CreateUserForm, {
  type CreateUserFormHandle,
} from '../templates/CreateUserForm'

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
  initialCpf?: string
  initialEmail?: string
}
export default function EventForm({
  eventoId,
  liderId,
  initialCpf,
  initialEmail,
}: EventFormProps) {
  const { config } = useTenant()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, user } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])
  const [campoNome, setCampoNome] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cobraInscricao, setCobraInscricao] = useState(false)
  const [form, setForm] = useState({
    genero: '',
    campoId: '',
    produtoId: '',
    tamanho: '',
    paymentMethod: 'pix',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [pendentes, setPendentes] = useState<Inscricao[]>([])
  const [checouPendentes, setChecouPendentes] = useState(false)
  const [signupDone, setSignupDone] = useState(isLoggedIn)
  const createUserRef = useRef<CreateUserFormHandle>(null)

  useEffect(() => {
    const campo = searchParams.get('campo') || user?.campo
    if (campo && !form.campoId) {
      setForm((prev) => ({ ...prev, campoId: campo }))
    }
  }, [searchParams, user, form.campoId])

  useEffect(() => {
    async function fetchData() {
      setFetching(true)
      try {
        const headers = getAuthHeaders(pb)
        const promises: Promise<Response>[] = [
          fetch(`/api/eventos/${eventoId}`, { headers, credentials: 'include' }),
        ]
        if (liderId) {
          promises.unshift(
            fetch(`/api/lider/${liderId}`, {
              headers,
              credentials: 'include',
            }),
          )
        } else {
          promises.unshift(fetch('/api/campos', { headers, credentials: 'include' }))
        }
        const [campoRes, eventoRes] = await Promise.all(promises)
        if (liderId) {
          const data = campoRes.ok ? await campoRes.json() : null
          setCampoNome(data?.campo || '')
          setForm((prev) => ({ ...prev, campoId: data?.campoId || '' }))
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectProduto = (id: string) => {
    setForm((prev) => ({ ...prev, produtoId: id, tamanho: '' }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const userData = user
      if (!userData) {
        showError('Usuário não autenticado.')
        setLoading(false)
        return
      }
      const url = liderId ? '/api/inscricoes' : '/loja/api/inscricoes'
      const payload = buildInscricaoPayload(userData, form, eventoId, liderId)
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
      router.replace('/inscricoes/conclusao')
    } catch {
      showError('Erro ao enviar inscrição.')
    } finally {
      setLoading(false)
    }
  }
  const handleStepValidate = async (index: number) => {
    if (!signupDone && index === 0) {
      const ok = await createUserRef.current?.submit()
      return Boolean(ok)
    }
    return true
  }

  const steps: { title: string; content: React.ReactNode }[] = []

  if (!signupDone) {
    steps.push({
      title: 'Criar Conta',
      content: (
        <CreateUserForm
          ref={createUserRef}
          onSuccess={() => setSignupDone(true)}
          showButton={false}
          initialCpf={initialCpf}
          initialEmail={initialEmail}
          initialCampo={form.campoId}
        />
      ),
    })
  } else if (!user?.genero) {
    steps.push({
      title: "Informações Adicionais",
      content: (
        <div className="space-y-4">
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
    })
  }



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
      title: 'Campo',
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

  steps.push({
    title: 'Revisão',
    content: (
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Nome:</span> {user?.nome}
        </p>
        <p>
          <span className="font-medium">CPF:</span> {user?.cpf}
        </p>
        <p>
          <span className="font-medium">E-mail:</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">Campo:</span>{' '}
          {campoNome ||
            campos.find((c) => c.id === form.campoId)?.nome ||
            user?.campo}
        </p>
        <p>
          <span className="font-medium">Produto/Tamanho:</span>{' '}
          {produtos.find((p) => p.id === form.produtoId)?.nome}
          {form.tamanho ? ` - ${form.tamanho}` : ''}
        </p>
        {cobraInscricao && (
          <p>
            <span className="font-medium">Forma de Pagamento:</span>{' '}
            {form.paymentMethod === 'pix' ? 'Pix' : 'Boleto'}
          </p>
        )}
      </div>
    ),
  })

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
      loading={loading}
      onStepValidate={handleStepValidate}
      className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
    />
  )
}
