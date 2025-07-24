'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'
import type { Vendedor } from '@/types'
import Link from 'next/link'
import { logger } from '@/lib/logger'

const STATUS_LABELS = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  suspenso: 'Suspenso'
}

const STATUS_COLORS = {
  pendente: 'text-yellow-600 bg-yellow-100',
  aprovado: 'text-green-600 bg-green-100',
  rejeitado: 'text-red-600 bg-red-100',
  suspenso: 'text-gray-600 bg-gray-100'
}

export default function AdminVendedoresPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])
  
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState<{ vendedor: Vendedor; acao: 'aprovar' | 'rejeitar' | 'suspender' } | null>(null)
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return

    fetchVendedores()
  }, [isLoggedIn, ctxUser?.role, authChecked, page, search, statusFilter])

  async function fetchVendedores() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/admin/api/vendedores?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar vendedores')
      }

      setVendedores(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (err) {
      logger.error('Erro ao carregar vendedores:', err)
      showError('Erro ao carregar vendedores')
    } finally {
      setLoading(false)
    }
  }

  async function handleVendedorAction(vendedorId: string, acao: 'aprovar' | 'rejeitar' | 'suspender', motivo?: string) {
    try {
      const res = await fetch(`/admin/api/vendedores/${vendedorId}/acoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao, motivo })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro na ação')
      }

      showSuccess(data.message)
      fetchVendedores()
      setShowApprovalModal(null)
      setMotivo('')
    } catch (err) {
      logger.error('Erro na ação do vendedor:', err)
      showError('Erro na ação do vendedor')
    }
  }

  function openApprovalModal(vendedor: Vendedor, acao: 'aprovar' | 'rejeitar' | 'suspender') {
    setShowApprovalModal({ vendedor, acao })
    setMotivo('')
  }

  if (!authChecked) return null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Vendedores
        </h2>
        <Link href="/admin/vendedores/novo" className="btn btn-primary">
          + Novo Vendedor
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </div>
      </div>

      {/* Lista de vendedores */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : vendedores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum vendedor encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Taxa</th>
                  <th>Produtos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.map((vendedor) => (
                  <tr key={vendedor.id}>
                    <td>
                      <div>
                        <div className="font-medium">{vendedor.nome}</div>
                        <div className="text-sm text-gray-500">{vendedor.email}</div>
                        <div className="text-sm text-gray-500">{vendedor.cpf_cnpj}</div>
                      </div>
                    </td>
                    <td>
                      <span className="capitalize">
                        {vendedor.tipo_pessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[vendedor.status]}`}>
                        {STATUS_LABELS[vendedor.status]}
                      </span>
                    </td>
                    <td>{vendedor.taxa_comissao}%</td>
                    <td>{vendedor.total_produtos}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/vendedores/${vendedor.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </Link>
                        
                        {vendedor.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => openApprovalModal(vendedor, 'aprovar')}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => openApprovalModal(vendedor, 'rejeitar')}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                        
                        {vendedor.status === 'aprovado' && (
                          <button
                            onClick={() => openApprovalModal(vendedor, 'suspender')}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                          >
                            Suspender
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {showApprovalModal.acao === 'aprovar' && 'Aprovar Vendedor'}
              {showApprovalModal.acao === 'rejeitar' && 'Rejeitar Vendedor'}
              {showApprovalModal.acao === 'suspender' && 'Suspender Vendedor'}
            </h3>
            
            <p className="mb-4">
              {showApprovalModal.acao === 'aprovar' && 
                `Tem certeza que deseja aprovar ${showApprovalModal.vendedor.nome}?`}
              {showApprovalModal.acao === 'rejeitar' && 
                `Tem certeza que deseja rejeitar ${showApprovalModal.vendedor.nome}?`}
              {showApprovalModal.acao === 'suspender' && 
                `Tem certeza que deseja suspender ${showApprovalModal.vendedor.nome}?`}
            </p>

            {(showApprovalModal.acao === 'rejeitar' || showApprovalModal.acao === 'suspender') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Motivo {showApprovalModal.acao === 'rejeitar' ? '(obrigatório)' : '(opcional)'}:
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="input w-full h-24"
                  placeholder="Digite o motivo..."
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApprovalModal(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleVendedorAction(
                  showApprovalModal.vendedor.id, 
                  showApprovalModal.acao, 
                  motivo || undefined
                )}
                className={`btn ${
                  showApprovalModal.acao === 'aprovar' ? 'btn-primary' : 
                  showApprovalModal.acao === 'rejeitar' ? 'bg-red-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}
                disabled={showApprovalModal.acao === 'rejeitar' && !motivo.trim()}
              >
                {showApprovalModal.acao === 'aprovar' && 'Aprovar'}
                {showApprovalModal.acao === 'rejeitar' && 'Rejeitar'}
                {showApprovalModal.acao === 'suspender' && 'Suspender'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}