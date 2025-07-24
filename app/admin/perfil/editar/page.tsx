'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import { useToast } from '@/lib/context/ToastContext'
import { FormField, TextField, InputWithMask } from '@/components'
import type { UserModel } from '@/types/UserModel'

export default function EditarPerfilPage() {
  const { user, authChecked } = useAuthGuard(['coordenador', 'lider'])
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [endereco, setEndereco] = useState('')
  const [bairro, setBairro] = useState('')
  const [numero, setNumero] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')

  useEffect(() => {
    async function loadUserInfo() {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/usuarios/${user.id}`)
        if (res.ok) {
          const data = (await res.json()) as UserModel
          setNome(String(data.nome ?? ''))
          setTelefone(String(data.telefone ?? ''))
          setCpf(String(data.cpf ?? ''))
          setDataNascimento(String(data.data_nascimento ?? ''))
          setEndereco(String(data.endereco ?? ''))
          setBairro(String(data.bairro ?? ''))
          setNumero(String(data.numero ?? ''))
          setEstado(String(data.estado ?? ''))
          setCep(String(data.cep ?? ''))
          setCidade(String(data.cidade ?? ''))
        } else if (user) {
          setNome(String(user.nome ?? ''))
          setTelefone(String(user.telefone ?? ''))
          setCpf(String(user.cpf ?? ''))
          setDataNascimento(String(user.data_nascimento ?? ''))
          setEndereco(String(user.endereco ?? ''))
          setBairro(String(user.bairro ?? ''))
          setNumero(String(user.numero ?? ''))
          setEstado(String(user.estado ?? ''))
          setCep(String(user.cep ?? ''))
          setCidade(String(user.cidade ?? ''))
        }
      } catch (err) {
        console.error(err)
        if (user) {
          setNome(String(user.nome ?? ''))
          setTelefone(String(user.telefone ?? ''))
          setCpf(String(user.cpf ?? ''))
          setDataNascimento(String(user.data_nascimento ?? ''))
          setEndereco(String(user.endereco ?? ''))
          setBairro(String(user.bairro ?? ''))
          setNumero(String(user.numero ?? ''))
          setEstado(String(user.estado ?? ''))
          setCep(String(user.cep ?? ''))
          setCidade(String(user.cidade ?? ''))
        }
      }
    }
    loadUserInfo()
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) {
      showError('Sess\u00e3o inv\u00e1lida.')
      return
    }
    try {
      await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          cpf: cpf.trim(),
          data_nascimento: dataNascimento,
          endereco: endereco.trim(),
          bairro: bairro.trim(),
          numero: numero.trim(),
          estado: estado.trim(),
          cep: cep.trim(),
          cidade: cidade.trim(),
        }),
      })
      showSuccess('Perfil atualizado com sucesso.')
      router.push('/admin/perfil')
    } catch (err) {
      console.error(err)
      showError('Erro ao atualizar perfil. Verifique os dados.')
    }
  }

  if (!authChecked) return null

  const inputStyle =
    'w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded'

  return (
    <form
      onSubmit={handleSave}
      className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow space-y-5"
    >
      <h1 className="text-xl font-semibold text-center">Editar Perfil</h1>

      <FormField label="Nome completo" htmlFor="perfil-nome">
        <TextField
          id="perfil-nome"
          type="text"
          placeholder="Nome completo"
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
          placeholder="Telefone"
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
          placeholder="CPF"
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

      <FormField label="Endere\u00e7o" htmlFor="perfil-endereco">
        <TextField
          id="perfil-endereco"
          type="text"
          placeholder="Endere\u00e7o"
          className={inputStyle}
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
      </FormField>

      <FormField label="Bairro" htmlFor="perfil-bairro">
        <TextField
          id="perfil-bairro"
          type="text"
          placeholder="Bairro"
          className={inputStyle}
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
      </FormField>

      <FormField label="N\u00famero" htmlFor="perfil-numero">
        <TextField
          id="perfil-numero"
          type="text"
          placeholder="N\u00famero"
          className={inputStyle}
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
      </FormField>

      <FormField label="Estado" htmlFor="perfil-estado">
        <TextField
          id="perfil-estado"
          type="text"
          placeholder="Estado"
          className={inputStyle}
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        />
      </FormField>

      <FormField label="CEP" htmlFor="perfil-cep">
        <TextField
          id="perfil-cep"
          type="text"
          placeholder="CEP"
          className={inputStyle}
          value={cep}
          onChange={(e) => setCep(e.target.value)}
        />
      </FormField>

      <FormField label="Cidade" htmlFor="perfil-cidade">
        <TextField
          id="perfil-cidade"
          type="text"
          placeholder="Cidade"
          className={inputStyle}
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />
      </FormField>

      <FormField label="E-mail" htmlFor="perfil-email" className="opacity-60">
        <TextField
          id="perfil-email"
          type="email"
          disabled
          value={String(user?.email || '')}
          className={`${inputStyle} cursor-not-allowed`}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          O e-mail n\u00e3o pode ser alterado. Para mudan\u00e7as, entre em
          contato com o suporte.
        </p>
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="text-sm text-gray-600 dark:text-gray-300"
          onClick={() => router.push('/admin/perfil')}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-2 rounded-lg"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
