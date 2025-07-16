'use client'
import { useMemo, useState, useEffect } from 'react'
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

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    produtoId: '',
    valor: '',
    vencimento: '',
  })

  const [produtoSel, setProdutoSel] = useState<Produto | undefined>(undefined)

  useEffect(() => {
    const prod = produtos.find((p) => p.id === form.produtoId)
    setProdutoSel(prod)
  }, [produtos, form.produtoId])

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
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'produtoId') {
      const prod = produtos.find((p) => p.id === value)
      setProdutoSel(prod)
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
          valor: Number(form.valor),
          email: form.email,
          vencimento: form.vencimento,
          canal: 'avulso',
          campoId: user.campo,
        }),
      })
      if (res.ok) {
        showSuccess('Pedido criado!')
        setForm({ nome: '', cpf: '', telefone: '', email: '', produtoId: '', valor: '', vencimento: '' })
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome" htmlFor="nome">
          <TextField id="nome" name="nome" value={form.nome} onChange={handleChange} required />
        </FormField>
        <FormField label="CPF" htmlFor="cpf" error={errors.cpf}>
          <InputWithMask id="cpf" name="cpf" mask="cpf" value={form.cpf} onChange={(e) => { handleChange(e); validate() }} required />
        </FormField>
        <FormField label="Telefone" htmlFor="telefone" error={errors.telefone}>
          <InputWithMask id="telefone" name="telefone" mask="telefone" value={form.telefone} onChange={(e) => { handleChange(e); validate() }} required />
        </FormField>
        <FormField label="E-mail" htmlFor="email" error={errors.email}>
          <TextField id="email" name="email" type="email" value={form.email} onChange={(e) => { handleChange(e); validate() }} required />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Valor" htmlFor="valor">
          <TextField id="valor" name="valor" type="number" value={form.valor} onChange={handleChange} required />
        </FormField>
        <FormField label="Vencimento" htmlFor="vencimento">
          <TextField id="vencimento" name="vencimento" type="date" value={form.vencimento} onChange={handleChange} required />
        </FormField>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        Criar pedido
      </button>
      <LoadingOverlay show={loading} text="Salvando..." />
    </form>
  )
}
