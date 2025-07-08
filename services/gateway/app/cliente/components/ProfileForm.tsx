'use client'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
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
  const [genero, setGenero] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [numero, setNumero] = useState('')
  const [estado, setEstado] = useState('')

  useEffect(() => {
    if (user) {
      setNome(String(user.nome ?? ''))
      setTelefone(String(user.telefone ?? ''))
      setCpf(String(user.cpf ?? ''))
      const nasc = String(user.data_nascimento ?? '')
      setDataNascimento(nasc ? nasc.split(' ')[0] : '')
      setCep(String(user.cep ?? ''))
      setEndereco(String(user.endereco ?? ''))
      setGenero(String(user.genero ?? ''))
      setBairro(String(user.bairro ?? ''))
      setCidade(String(user.cidade ?? ''))
      setNumero(String(user.numero ?? ''))
      setEstado(String(user.estado ?? ''))
    }
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    try {
      const headers = {
        ...getAuthHeaders(pb),
        'Content-Type': 'application/json',
      }
      const res = await fetch('/api/usuario/atualizar-dados', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          data_nascimento: dataNascimento,
          genero,
          cep,
          endereco,
          bairro,
          cidade,
          numero,
          estado,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        pb.authStore.save(pb.authStore.token, updated)
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
      <FormField label="Gênero" htmlFor="perfil-genero">
        <select
          id="perfil-genero"
          className={inputStyle}
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
        >
          <option value="">Selecione</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>
      </FormField>
      <FormField label="CEP" htmlFor="perfil-cep">
        <TextField
          id="perfil-cep"
          type="text"
          className={inputStyle}
          value={cep}
          onChange={(e) => setCep(e.target.value)}
        />
      </FormField>
      <FormField label="Endereço" htmlFor="perfil-endereco">
        <TextField
          id="perfil-endereco"
          type="text"
          className={inputStyle}
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
      </FormField>
      <FormField label="Bairro" htmlFor="perfil-bairro">
        <TextField
          id="perfil-bairro"
          type="text"
          className={inputStyle}
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
      </FormField>
      <FormField label="Cidade" htmlFor="perfil-cidade">
        <TextField
          id="perfil-cidade"
          type="text"
          className={inputStyle}
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
      </FormField>
      <FormField label="Número" htmlFor="perfil-numero">
        <TextField
          id="perfil-numero"
          type="text"
          className={inputStyle}
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
      </FormField>
      <FormField label="Estado" htmlFor="perfil-estado">
        <TextField
          id="perfil-estado"
          type="text"
          className={inputStyle}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
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
