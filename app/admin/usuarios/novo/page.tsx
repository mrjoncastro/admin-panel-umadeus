'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { PasswordField } from '@/components'

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

export default function NovoUsuarioPage() {
  const { showError, showSuccess } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [role, setRole] = useState('usuario')
  const [campoId, setCampoId] = useState('')
  const [campos, setCampos] = useState<Campo[]>([])

  useEffect(() => {
    if (!authChecked) return
    fetch('/admin/api/campos')
      .then((res) => res.json())
      .then((data) => setCampos(data))
      .catch(() => showError('Erro ao carregar os campos.'))
  }, [showError, authChecked])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/admin/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome,
        email,
        password: senha,
        passwordConfirm: senha,
        telefone,
        cpf,
        data_nascimento: dataNascimento,
        role,
        campo: campoId,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      showSuccess('Usuário cadastrado com sucesso!')
      setNome('')
      setEmail('')
      setSenha('')
      setTelefone('')
      setCpf('')
      setDataNascimento('')
      setRole('usuario')
      setCampoId('')
    } else {
      showError('Erro: ' + (data?.error || 'Erro desconhecido'))
    }
  }

  if (!authChecked) return null

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Novo Usuário</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="tel"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          className="w-full border rounded p-2"
          maxLength={15}
          required
        />

        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          className="w-full border rounded p-2"
          maxLength={14}
          required
        />

        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <PasswordField
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="usuario">Usuário</option>
          <option value="lider">Liderança</option>
          <option value="coordenador">Coordenador</option>
        </select>

        <select
          value={campoId}
          onChange={(e) => setCampoId(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Selecione um campo</option>
          {campos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-danger w-full">
          Cadastrar
        </button>
      </form>
    </main>
  )
}
