'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

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
  const [usuario, setUsuario] = useState<UsuarioAuthModel | null>(
    usuarioGuard as UsuarioAuthModel | null,
  )

  useEffect(() => {
    if (usuarioGuard) {
      setUsuario(usuarioGuard as UsuarioAuthModel)
    }
  }, [usuarioGuard])


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

      <div className="space-y-2 text-zinc-700 dark:text-zinc-200">
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
        <Link
          href="/admin/perfil/editar"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          Editar Perfil
        </Link>
      </div>
    </div>
  )
}
