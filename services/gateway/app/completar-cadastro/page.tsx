'use client'

import { useEffect, useState, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { fetchCep } from '@/utils/cep'
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
  const pb = useMemo(() => createPocketBase(), [])

  const [dataNasc, setDataNasc] = useState('')
  const [genero, setGenero] = useState('')
  const [cep, setCep] = useState('')
  const [numero, setNumero] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [campoId, setCampoId] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authChecked) return
    fetch('/api/campos', {
      headers: getAuthHeaders(pb),
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setCampos(d)
      })
      .catch(() => {})
  }, [authChecked, pb])

  useEffect(() => {
    async function lookup() {
      const data = await fetchCep(cep).catch(() => null)
      if (!data) {
        showError('CEP não encontrado.')
        return
      }
      setEndereco(data.street)
      setBairro(data.neighborhood)
      setCidade(data.city)
      setEstado(data.state)
    }
    if (cep.replace(/\D/g, '').length === 8) lookup()
  }, [cep, showError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authChecked) return
    setLoading(true)
    try {
      const res = await fetch('/api/usuario/atualizar-dados', {
        method: 'PATCH',
        headers: { ...getAuthHeaders(pb), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          data_nascimento: dataNasc,
          genero,
          cep,
          numero,
          cidade,
          estado,
          endereco,
          bairro,
          campo_id: campoId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showError(data?.error || 'Erro ao atualizar dados.')
        return
      }
      showSuccess('Dados atualizados!')
      router.push('/cliente/dashboard')
    } catch (err) {
      console.error('Erro ao atualizar dados:', err)
      showError('Erro ao atualizar dados.')
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Coluna de boas-vindas */}
      <div className="md:w-1/2 bg-[var(--accent)] text-white flex flex-col justify-center p-8">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-md">
            🎉 Bem-vindo(a)!
          </h1>
          <p className="text-lg text-white/90 leading-relaxed drop-shadow-sm">
            Estamos quase lá! Complete as informações abaixo para finalizar seu
            cadastro e acessar todos os recursos da plataforma.
          </p>
        </div>
      </div>

      {/* Coluna do formulário */}
      <div className="md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
            <div
              className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
              style={{ width: '90%' }}
            />
          </div>

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
              />
            </FormField>
            <FormField label="Número" htmlFor="cadastro-numero">
              <TextField
                id="cadastro-numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </FormField>
            <FormField label="Endereço" htmlFor="cadastro-endereco">
              <TextField
                id="cadastro-endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </FormField>
            <FormField label="Bairro" htmlFor="cadastro-bairro">
              <TextField
                id="cadastro-bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </FormField>
            <FormField label="Cidade" htmlFor="cadastro-cidade">
              <TextField
                id="cadastro-cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </FormField>
            <FormField label="Estado" htmlFor="cadastro-estado">
              <TextField
                id="cadastro-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              />
            </FormField>
            <FormField label="Campo" htmlFor="cadastro-campo">
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
      </div>
    </div>
  )
}
