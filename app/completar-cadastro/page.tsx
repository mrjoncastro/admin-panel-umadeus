'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextField, FormField, Button, Spinner } from '@/components'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Campo {
  id: string
  nome: string
}

export default function CompletarCadastroPage() {
  const { authChecked } = useAuthGuard(['usuario'])
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const [dataNasc, setDataNasc] = useState('')
  const [genero, setGenero] = useState('')
  const [cep, setCep] = useState('')
  const [numero, setNumero] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [endereco, setEndereco] = useState('')
  const [campoId, setCampoId] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authChecked) return
    fetch('/api/campos')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setCampos(d)
      })
      .catch(() => {})
  }, [authChecked])

  useEffect(() => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    fetch(`https://viacep.com.br/ws/${clean}/json/`)
      .then((r) => r.json())
      .then((d) => {
        if (!d || d.erro) {
          showError('CEP não encontrado.')
          return
        }
        setEndereco(d.logradouro || '')
        setCidade(d.localidade || '')
        setEstado(d.uf || '')
      })
      .catch(() => showError('Erro ao buscar o CEP.'))
  }, [cep, showError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authChecked) return
    setLoading(true)
    try {
      const res = await fetch('/api/usuario/atualizar-dados', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_nascimento: dataNasc,
          genero,
          cep,
          numero,
          cidade,
          estado,
          endereco,
          campo_id: campoId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showError(data?.error || 'Erro ao atualizar dados.')
        return
      }
      showSuccess('Dados atualizados!')
      router.push('/loja/cliente')
    } catch (err) {
      console.error('Erro ao atualizar dados:', err)
      showError('Erro ao atualizar dados.')
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-[var(--accent)]">
        Completar Cadastro
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Data de nascimento" htmlFor="cadastro-data">
          <TextField
            id="cadastro-data"
            type="date"
            value={dataNasc}
            onChange={(e) => setDataNasc(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Gênero" htmlFor="cadastro-genero">
          <select
            id="cadastro-genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="input-base"
            required
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </FormField>
        <FormField label="CEP" htmlFor="cadastro-cep">
          <TextField
            id="cadastro-cep"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Número" htmlFor="cadastro-numero">
          <TextField
            id="cadastro-numero"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Endereço" htmlFor="cadastro-endereco">
          <TextField
            id="cadastro-endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Cidade" htmlFor="cadastro-cidade">
          <TextField
            id="cadastro-cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Estado" htmlFor="cadastro-estado">
          <TextField
            id="cadastro-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Campo de atuação" htmlFor="cadastro-campo">
          <select
            id="cadastro-campo"
            value={campoId}
            onChange={(e) => setCampoId(e.target.value)}
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="w-4 h-4" /> Enviando...
            </span>
          ) : (
            'Finalizar'
          )}
        </Button>
      </form>
    </div>
  )
}
