'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import ModalEditarPerfil from './components/ModalEditarPerfil'
import createPocketBase from '@/lib/pocketbase'

interface UsuarioAuthModel {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  data_nascimento?: string
  endereco?: string
  numero?: string
  estado?: string
  cep?: string
  cidade?: string
  role: 'coordenador' | 'lider' | string
  campo?: string
  expand?: {
    campo?: {
      nome: string
    }
  }
}

export default function PerfilPage() {
  const { user: usuarioGuard, authChecked } = useAuthGuard([
    'coordenador',
    'lider',
  ])
  const pb = useMemo(() => createPocketBase(), [])
  const [usuario, setUsuario] = useState<UsuarioAuthModel | null>(
    usuarioGuard as UsuarioAuthModel | null,
  )
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    if (usuarioGuard) {
      setUsuario(usuarioGuard as UsuarioAuthModel)
    }
  }, [usuarioGuard])

  // Atualiza local após edição
  const atualizarDados = () => {
    const model = pb.authStore.model as unknown as UsuarioAuthModel
    setUsuario(model)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">403 - Acesso negado</h1>
      </div>
    )
  }

  if (!usuario) return null

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
        Seu Perfil
      </h2>

      <div className="space-y-2 text-zinc-700 dark:text-zinc-200 perfil-dados">
        <p>
          <span className="font-semibold">Nome:</span> {usuario.nome}
        </p>
        <p>
          <span className="font-semibold">E-mail:</span> {usuario.email}
        </p>
        <p>
          <span className="font-semibold">Campo de Atuação:</span>{' '}
          {usuario.expand?.campo?.nome || 'Não vinculado'}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 btn-editar-perfil"
        >
          Editar Perfil
        </button>
      </div>

      {mostrarModal && (
        <ModalEditarPerfil
          onClose={() => {
            setMostrarModal(false)
            atualizarDados()
          }}
        />
      )}
    </div>
  )
}
