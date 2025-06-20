'use client'

import React, { useState, useEffect } from 'react'
import { useTenant } from '@/lib/context/TenantContext'
import { useToast } from '@/lib/context/ToastContext'
import FormWizard from './FormWizard'
import { FormField, InputWithMask, TextField } from '@/components'
import Spinner from '@/components/atoms/Spinner'

interface Produto {
  id: string
  nome: string
  tamanhos?: string[]
}

interface InscricaoWizardProps {
  liderId: string
  eventoId: string
  loading?: boolean
}

export default function InscricaoWizard({
  liderId,
  eventoId,
}: InscricaoWizardProps) {
  const { config } = useTenant()
  const { showSuccess, showError } = useToast()
  const [campoNome, setCampoNome] = useState('')
  const [produtos, setProdutos] = useState<Produto[]>([])
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
    produtoId: '',
    tamanho: '',
    paymentMethod: 'pix',
    installments: 1,
  })

  useEffect(() => {
    fetch(`/api/lider/${liderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCampoNome(data?.campo || ''))
      .catch(() => setCampoNome(''))
  }, [liderId])

  useEffect(() => {
    fetch(`/api/eventos/${eventoId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const lista = Array.isArray(data?.expand?.produtos)
          ? (data.expand.produtos as Produto[]).map((p) => ({
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
      })
      .catch(() => setProdutos([]))
  }, [eventoId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          campoId: campoNome,
          produtoId: form.produtoId,
          tamanho: form.tamanho,
          liderId,
          eventoId,
          paymentMethod: form.paymentMethod,
          installments: form.installments,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        showError(data.erro || 'Erro ao enviar inscrição.')
        return
      }
      showSuccess('Inscrição enviada com sucesso!')
    } catch {
      showError('Erro ao enviar inscrição.')
    } finally {
      /* noop */
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
    {
      title: 'Campo de Atuação',
      content: (
        <div className="p-4 text-center">
          {campoNome ? <p>{campoNome}</p> : <Spinner className="w-4 h-4" />}
        </div>
      ),
    },
    {
      title: 'Produto Vinculado',
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
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
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
    },
  ]

  if (!config.confirmaInscricoes) {
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

  return (
    <FormWizard
      steps={steps}
      onFinish={handleSubmit}
      loading={loading}
      className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow"
    />
  )
}
