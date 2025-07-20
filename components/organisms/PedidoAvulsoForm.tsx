'use client'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormField, TextField, InputWithMask } from '@/components'
import type { Produto } from '@/types'
import LoadingOverlay from './LoadingOverlay'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import useProdutos from '@/lib/hooks/useProdutos'
import { isValidCPF, isValidEmail } from '@/utils/validators'

export default function PedidoAvulsoForm() {
  const { user } = useAuthContext()
  const pb = useMemo(() => createPocketBase(), [])
  const { produtos } = useProdutos()
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    produtoId: '',
    tamanho: '',
    genero: '',
    valor: '',
    paymentMethod: 'pix',
  })

  const [produtoSel, setProdutoSel] = useState<Produto | undefined>(undefined)
  const tamanhosDisponiveis = useMemo(() => {
    if (!produtoSel) return [] as string[]
    const list = Array.isArray(produtoSel.tamanhos)
      ? produtoSel.tamanhos
      : typeof produtoSel.tamanhos === 'string'
        ? produtoSel.tamanhos.split(',').map((t) => t.trim())
        : []
    return list
  }, [produtoSel])

  useEffect(() => {
    const prod = produtos.find((p) => p.id === form.produtoId)
    setProdutoSel(prod)
    if (prod) {
      const tamanhos = Array.isArray(prod.tamanhos)
        ? prod.tamanhos
        : typeof prod.tamanhos === 'string'
          ? prod.tamanhos.split(',').map((t: string) => t.trim())
          : []
      setForm((prev) => ({
        ...prev,
        valor: String(prod.preco_bruto),
        tamanho: tamanhos[0] || '',
      }))
    }
  }, [produtos, form.produtoId])

  useEffect(() => {
    const cleanCpf = form.cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return
    async function lookup() {
      try {
        const res = await fetch(`/api/usuarios/by-cpf?cpf=${cleanCpf}`)
        if (res.ok) {
          const data = await res.json()
          setForm((prev) => ({
            ...prev,
            nome: prev.nome || data.nome || '',
            telefone: prev.telefone || data.telefone || '',
            email: prev.email || data.email || '',
            genero: data.genero || prev.genero,
          }))
        }
      } catch {
        // ignore
      }
    }
    lookup()
  }, [form.cpf])

  useEffect(() => {
    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cpf, form.email, form.telefone])

  const [errors, setErrors] = useState<{ cpf?: string; email?: string; telefone?: string }>({})
  const [loading, setLoading] = useState(false)


  const validate = () => {
    const err: { cpf?: string; email?: string; telefone?: string } = {}
    if (!isValidCPF(form.cpf)) err.cpf = 'CPF inválido'
    if (!isValidEmail(form.email)) err.email = 'E-mail inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) err.telefone = 'Telefone inválido'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'produtoId') {
      const prod = produtos.find((p) => p.id === value)
      setProdutoSel(prod)
      setForm((prev) => ({
        ...prev,
        produtoId: value,
        valor: prod ? String(prod.preco_bruto) : '',
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!user?.campo) {
      showError('Campo do líder não encontrado.')
      return
    }
    setLoading(true)
    try {
      const headers = { ...getAuthHeaders(pb), 'Content-Type': 'application/json' }
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          produto: [form.produtoId],
          tamanho: form.tamanho,
          genero: form.genero,
          valor: Number(form.valor),
          email: form.email,
          paymentMethod: form.paymentMethod,
          canal: 'avulso',
          campoId: user.campo,
        }),
      })
      if (res.ok) {
        const { pedidoId, valor } = await res.json()
        const payRes = await fetch('/api/asaas', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            pedidoId,
            valorBruto: valor,
            paymentMethod: form.paymentMethod,
          }),
        })
        if (payRes.ok) {
          showSuccess('Pedido criado!')
          setTimeout(() => router.push('/admin/pedidos'), 1000)
          setForm({
            nome: '',
            cpf: '',
            telefone: '',
            email: '',
            produtoId: '',
            tamanho: '',
            genero: '',
            valor: '',
            paymentMethod: 'pix',
          })
        } else {
          const err = await payRes.json().catch(() => null)
          showError(err?.error || 'Erro ao gerar cobrança.')
        }
      } else {
        const data = await res.json().catch(() => null)
        showError(data?.erro || data?.error || 'Erro ao criar pedido.')
      }
    } catch {
      showError('Erro ao criar pedido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Nome" htmlFor="nome">
          <TextField id="nome" name="nome" value={form.nome} onChange={handleChange} required />
        </FormField>
        <FormField label="CPF" htmlFor="cpf" error={errors.cpf}>
          <InputWithMask
            id="cpf"
            name="cpf"
            mask="cpf"
            value={form.cpf}
            onChange={handleChange}
            onBlur={validate}
            required
          />
        </FormField>
        <FormField label="Telefone" htmlFor="telefone" error={errors.telefone}>
          <InputWithMask
            id="telefone"
            name="telefone"
            mask="telefone"
            value={form.telefone}
            onChange={handleChange}
            onBlur={validate}
            required
          />
        </FormField>
        <FormField label="E-mail" htmlFor="email" error={errors.email}>
          <TextField
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={validate}
            required
          />
        </FormField>
      </div>
      <FormField label="Produto" htmlFor="produtoId">
        <select id="produtoId" name="produtoId" value={form.produtoId} onChange={handleChange} className="input-base w-full" required>
          <option value="">Selecione</option>
      {produtos.map((p) => (
        <option key={p.id} value={p.id}>
          {p.nome}
        </option>
      ))}
        </select>
        {produtoSel?.evento_id && (
          <p className="text-sm mt-2">
            Produto vinculado a evento.{' '}
            <Link
              href={`/inscricoes/lider/${user?.id}/evento/${produtoSel.evento_id}?cpf=${form.cpf}&email=${form.email}`}
              className="text-primary underline"
            >
              Iniciar inscrição
            </Link>
          </p>
        )}
      </FormField>
      {tamanhosDisponiveis.length > 0 && (
        <FormField label="Tamanho" htmlFor="tamanho">
          <select
            id="tamanho"
            name="tamanho"
            value={form.tamanho}
            onChange={handleChange}
            className="input-base w-full"
            required
          >
            {tamanhosDisponiveis.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Valor" htmlFor="valor">
          <TextField
            id="valor"
            name="valor"
            type="number"
            value={form.valor}
            readOnly
            required
          />
        </FormField>
        <FormField label="Forma de Pagamento" htmlFor="paymentMethod">
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="input-base w-full"
          >
            <option value="pix">Pix</option>
            <option value="boleto">Boleto</option>
          </select>
        </FormField>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        Criar pedido
      </button>
      <LoadingOverlay show={loading} text="Salvando..." />
    </form>
  )
}
