'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/lib/context/ToastContext'
import Link from 'next/link'
import type { Evento } from '@/types'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Usuario {
  id: string
  nome: string
  email: string
  role: 'coordenador' | 'lider' | 'usuario'
  expand?: {
    campo?: {
      nome: string
    }
  }
}

export default function UsuariosPage() {
  const { showError } = useToast()
  const { user, authChecked } = useAuthGuard(['coordenador'])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoId, setEventoId] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroRole, setFiltroRole] = useState('')
  const [filtroCampo, setFiltroCampo] = useState('')

  useEffect(() => {
    if (!authChecked) return
    async function fetchUsuarios() {
      try {
        const res = await fetch('/admin/api/usuarios')

        if (!res.ok) {
          const erro = await res.json()
          showError('Erro ao buscar usuários: ' + erro.error)
          return
        }

        const data = await res.json()
        setUsuarios(data)
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error)
        showError('Erro inesperado ao carregar usuários.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [showError, authChecked])

  useEffect(() => {
    if (!authChecked) return
    async function fetchEventos() {
      try {
        const res = await fetch('/admin/api/eventos')
        if (!res.ok) return
        const data = await res.json()
        const ativos = Array.isArray(data)
          ? data.filter((e: Evento) => e.status !== 'realizado')
          : []
        setEventos(ativos)
        if (ativos.length > 0) setEventoId(ativos[0].id)
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
      }
    }

    fetchEventos()
  }, [authChecked])

  const usuariosFiltrados = usuarios.filter((u) => {
    const buscaLower = busca.toLowerCase()
    const matchBusca =
      busca === '' ||
      u.nome.toLowerCase().includes(buscaLower) ||
      u.email.toLowerCase().includes(buscaLower)
    const matchRole = filtroRole === '' || u.role === filtroRole
    const matchCampo =
      filtroCampo === '' ||
      u.expand?.campo?.nome?.toLowerCase().includes(filtroCampo.toLowerCase())
    return matchBusca && matchRole && matchCampo
  })

  if (!authChecked) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="heading">Usuários Cadastrados</h2>
        <div className="flex items-center gap-4">
          {eventos.length > 0 ? (
            <select
              value={eventoId}
              onChange={(e) => setEventoId(e.target.value)}
              className="border rounded p-2 text-sm bg-white shadow-sm"
            >
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.titulo}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-500">Nenhum evento ativo</span>
          )}
          <Link href="/admin/usuarios/novo" className="btn btn-primary">
            + Adicionar Novo Usuário
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border rounded px-4 py-2 text-sm w-full md:w-64 shadow-sm"
        />
        <select
          value={filtroRole}
          onChange={(e) => setFiltroRole(e.target.value)}
          className="border rounded px-4 py-2 text-sm bg-white shadow-sm"
        >
          <option value="">Todas as Funções</option>
          <option value="coordenador">Coordenador</option>
          <option value="lider">Líder</option>
          <option value="usuario">Usuário</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por campo"
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="border rounded px-4 py-2 text-sm w-full md:w-60 shadow-sm"
        />
      </div>

      {loading ? (
        <LoadingOverlay show={true} text="Carregando usuários..." />
      ) : (
        <div className="overflow-auto rounded-lg border bg-white border-gray-300 dark:bg-neutral-950 dark:border-gray-700 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Campo</th>
                <th>Link de Inscrição</th>
                {user?.role === 'coordenador' && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="font-medium">{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td className="capitalize">{usuario.role}</td>
                  <td>{usuario.expand?.campo?.nome ?? '—'}</td>
                  <td>
                    {usuario.role === 'lider' ? (
                      eventos.length > 0 ? (
                        <Link
                          href={`/inscricoes/lider/${usuario.id}/evento/${eventoId}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          Ver link
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Nenhum evento ativo
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {user?.role === 'coordenador' && (
                    <td>
                      <Link
                        href={`/admin/usuarios/${usuario.id}/editar`}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
