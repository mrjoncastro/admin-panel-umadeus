'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { useToast } from '@/lib/context/ToastContext'
import { FormField, TextField, InputWithMask } from '@/components'

export default function ProfileForm() {
  const { user, authChecked } = useAuthGuard(['usuario'])
  const pb = useMemo(() => createPocketBase(), [])
  const { showSuccess, showError } = useToast()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

  useEffect(() => {
    if (user) {
      setNome(String(user.nome ?? ''))
      setTelefone(String(user.telefone ?? ''))
      setCpf(String(user.cpf ?? ''))
      setDataNascimento(String(user.data_nascimento ?? ''))
    }
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    try {
      const token = pb.authStore.token
      const headers = {
        Authorization: `Bearer ${token}`,
        'X-PB-User': JSON.stringify(user),
        'Content-Type': 'application/json',
      }
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          data_nascimento: dataNascimento,
        }),
      })
      if (res.ok) {
        showSuccess('Dados atualizados!')
      } else {
        showError('Erro ao salvar.')
      }
    } catch {
      showError('Erro ao salvar.')
    }
  }

  if (!authChecked) return null

  const inputStyle =
    'w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded'

  return (
    <form onSubmit={handleSave} className="card space-y-4">
      <h3 className="text-lg font-semibold">Perfil</h3>
      <FormField label="Nome completo" htmlFor="perfil-nome">
        <TextField
          id="perfil-nome"
          type="text"
          className={inputStyle}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </FormField>
      <FormField label="Telefone" htmlFor="perfil-telefone">
        <InputWithMask
          id="perfil-telefone"
          type="text"
          mask="telefone"
          className={inputStyle}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </FormField>
      <FormField label="CPF" htmlFor="perfil-cpf">
        <InputWithMask
          id="perfil-cpf"
          type="text"
          mask="cpf"
          className={inputStyle}
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        />
      </FormField>
      <FormField label="Data de nascimento" htmlFor="perfil-data">
        <TextField
          id="perfil-data"
          type="date"
          className={inputStyle}
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
      </FormField>
      <div className="text-right">
        <button className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded">
          Salvar
        </button>
      </div>
    </form>
  )
}
