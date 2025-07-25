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
import ModalEditarPerfil from '@/app/admin/perfil/components/ModalEditarPerfil'
import { Pencil } from 'lucide-react'
import type { UserModel } from '@/types/UserModel'
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
  const [userData, setUserData] = useState<UserModel | null>(user)
  const [showEditPerfil, setShowEditPerfil] = useState(false)
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
  const [inscricoesExistentes, setInscricoesExistentes] = useState<Inscricao[]>(
    [],
  )
  const [checouPendentes, setChecouPendentes] = useState(false)
  const [signupDone, setSignupDone] = useState(isLoggedIn)
  const createUserRef = useRef<CreateUserFormHandle>(null)

  useEffect(() => {
    setUserData(user)
  }, [user])

  useEffect(() => {
    const campo = searchParams.get('campo') || userData?.campo
    if (campo && !form.campoId) {
      setForm((prev) => ({ ...prev, campoId: campo }))
    }
  }, [searchParams, userData, form.campoId])

  useEffect(() => {
    async function fetchData() {
      setFetching(true)
      try {
        const headers = getAuthHeaders(pb)
        const promises: Promise<Response>[] = [
          fetch(`/api/eventos/${eventoId}`, {
            headers,
            credentials: 'include',
          }),
        ]
        if (liderId) {
          promises.unshift(
            fetch(`/api/lider/${liderId}`, {
              headers,
              credentials: 'include',
            }),
          )
        } else {
          promises.unshift(
            fetch('/api/campos', { headers, credentials: 'include' }),
          )
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
        const resPendentes = await fetch(
          `/api/inscricoes?status=pendente&evento=${eventoId}`,
          { headers, credentials: 'include' },
        )
        const resAguardando = await fetch(
          `/api/inscricoes?status=aguardando_pagamento&evento=${eventoId}`,
          { headers, credentials: 'include' },
        )
        const resConfirmadas = await fetch(
          `/api/inscricoes?status=confirmado&evento=${eventoId}`,
          { headers, credentials: 'include' },
        )
        if (resPendentes.ok && resAguardando.ok && resConfirmadas.ok) {
          const dataPendentes = await resPendentes.json()
          const pendentes = Array.isArray(dataPendentes)
            ? dataPendentes
            : Array.isArray(dataPendentes.items)
              ? (dataPendentes.items as Inscricao[])
              : []
          const dataAguardando = await resAguardando.json()
          const aguardando = Array.isArray(dataAguardando)
            ? dataAguardando
            : Array.isArray(dataAguardando.items)
              ? (dataAguardando.items as Inscricao[])
              : []
          const dataConfirmadas = await resConfirmadas.json()
          const confirmadas = Array.isArray(dataConfirmadas)
            ? dataConfirmadas
            : Array.isArray(dataConfirmadas.items)
              ? (dataConfirmadas.items as Inscricao[])
              : []
          const minhasInscricoes = [
            ...pendentes,
            ...aguardando,
            ...confirmadas,
          ].filter((i) => i.criado_por === user.id)
          setInscricoesExistentes(minhasInscricoes)
          if (minhasInscricoes.length > 0) {
            router.replace('/recuperar')
            return
          }
        } else {
          setInscricoesExistentes([])
        }
      } catch {
        setInscricoesExistentes([])
      } finally {
        setChecouPendentes(true)
      }
    }
    verificarPendentes()
  }, [isLoggedIn, user, eventoId, pb, router])
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
      const current = userData
      if (!current) {
        showError('Usuário não autenticado.')
        setLoading(false)
        return
      }
      const url = liderId ? '/api/inscricoes' : '/loja/api/inscricoes'
      const payload = buildInscricaoPayload(current, form, eventoId, liderId)
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

    const reviewStepIndex = steps.length - 2
    if (index === reviewStepIndex) {
      const missing: string[] = []
      if (!userData?.nome) missing.push('nome')
      if (!userData?.email) missing.push('email')
      if (!userData?.telefone) missing.push('telefone')
      if (!userData?.cpf) missing.push('cpf')
      if (!userData?.data_nascimento) missing.push('data de nascimento')
      if (!userData?.genero && !form.genero) missing.push('gênero')
      if (!form.campoId && !userData?.campo) missing.push('campo')
      if (!form.produtoId) missing.push('produto')
      const produto = produtos.find((p) => p.id === form.produtoId)
      if (produto?.tamanhos?.length && !form.tamanho) missing.push('tamanho')
      if (cobraInscricao && !form.paymentMethod)
        missing.push('forma de pagamento')
      if (missing.length > 0) {
        showError(
          `Atualize seu perfil: faltam ${missing.join(', ')} antes de prosseguir.`,
        )
        return false
      }
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
  } else if (!userData?.genero) {
    steps.push({
      title: 'Informações Adicionais',
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
              required={
                (produtos.find((p) => p.id === form.produtoId)?.tamanhos
                  ?.length ?? 0) > 0
              }
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
        <button
          type="button"
          onClick={() => setShowEditPerfil(true)}
          className="flex items-center gap-1 text-blue-600 hover:underline mb-1"
        >
          <Pencil className="w-4 h-4" /> Editar dados
        </button>
        <p>
          <span className="font-medium">Nome:</span> {userData?.nome}
        </p>
        <p>
          <span className="font-medium">Telefone:</span> {userData?.telefone}
        </p>
        <p>
          <span className="font-medium">CPF:</span> {userData?.cpf}
        </p>
        <p>
          <span className="font-medium">E-mail:</span> {userData?.email}
        </p>
        <p>
          <span className="font-medium">Data de Nascimento:</span>{' '}
          {userData?.data_nascimento}
        </p>
        <p>
          <span className="font-medium">Endereço:</span> {userData?.endereco},{' '}
          {userData?.numero}
        </p>
        <p>
          <span className="font-medium">Bairro:</span> {userData?.bairro}
        </p>
        <p>
          <span className="font-medium">Cidade:</span> {userData?.cidade}
        </p>
        <p>
          <span className="font-medium">Estado:</span> {userData?.estado}
        </p>
        <p>
          <span className="font-medium">CEP:</span> {userData?.cep}
        </p>
        <p>
          <span className="font-medium">Gênero:</span>{' '}
          {form.genero || userData?.genero}
        </p>
        <p>
          <span className="font-medium">Campo:</span>{' '}
          {campoNome ||
            campos.find((c) => c.id === form.campoId)?.nome ||
            userData?.campo}
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

  if (checouPendentes && inscricoesExistentes.length > 0) {
    return (
      <InscricoesTable inscricoes={inscricoesExistentes} variant="details" />
    )
  }

  return (
    <>
      <FormWizard
        steps={steps}
        onFinish={handleSubmit}
        loading={loading}
        onStepValidate={handleStepValidate}
        className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
      />
      {showEditPerfil && (
        <ModalEditarPerfil
          onClose={() => {
            setShowEditPerfil(false)
            const model = pb.authStore.model as unknown as UserModel
            setUserData(model)
          }}
        />
      )}
    </>
  )
}
