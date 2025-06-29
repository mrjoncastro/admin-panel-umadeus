'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'

interface Campo {
  id: string
  nome: string
}

function formatTelefone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [role, setRole] = useState('usuario')
  const [campoId, setCampoId] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authChecked) return
    fetch('/admin/api/campos')
      .then((res) => res.json())
      .then((data) => setCampos(Array.isArray(data) ? data : []))
      .catch(() => showError('Erro ao carregar os campos.'))
  }, [authChecked, showError])

  useEffect(() => {
    if (!authChecked) return
    fetch(`/admin/api/usuarios/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNome(data.nome)
        setTelefone(formatTelefone(data.telefone || ''))
        setCpf(formatCpf(data.cpf || ''))
        const nasc = String(data.data_nascimento || '')
        setDataNascimento(nasc ? nasc.split(' ')[0] : '')
        setRole(data.role)
        setCampoId(data.campo || '')
      })
      .catch(() => showError('Erro ao carregar usuário.'))
      .finally(() => setLoading(false))
  }, [id, authChecked, showError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/admin/api/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        telefone,
        cpf,
        data_nascimento: dataNascimento,
        role,
        campo: campoId,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      showSuccess('Usuário atualizado com sucesso!')
      router.push('/admin/usuarios')
    } else {
      showError('Erro: ' + (data?.error || 'Erro desconhecido'))
    }
  }

  if (!authChecked || loading) {
    return <LoadingOverlay show={true} text="Carregando..." />
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Editar Usuário</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full border rounded p-2"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="tel"
          className="w-full border rounded p-2"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          maxLength={15}
        />
        <input
          type="text"
          className="w-full border rounded p-2"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          maxLength={14}
        />
        <input
          type="date"
          className="w-full border rounded p-2"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
        <select
          className="w-full border rounded p-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="usuario">Usuário</option>
          <option value="lider">Liderança</option>
          <option value="coordenador">Coordenador</option>
        </select>
        <select
          className="w-full border rounded p-2"
          value={campoId}
          onChange={(e) => setCampoId(e.target.value)}
        >
          <option value="">Selecione um campo</option>
          {campos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <Link href="/admin/usuarios" className="btn flex-1">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  )
}

