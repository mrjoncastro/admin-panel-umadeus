'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Vendor } from '../../../types/marketplace'
import { 
  fetchVendors, 
  aprovarVendor, 
  rejeitarVendor,
  fetchVendorAnalytics 
} from '../../../lib/services/marketplace'
import { createTenantPocketBase } from '../../../lib/pocketbase'

export default function AdminFornecedores() {
  const [fornecedores, setFornecedores] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Vendor['status'] | 'todos'>('todos')
  const [showMotivoRejeicao, setShowMotivoRejeicao] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const pb = createTenantPocketBase()
      
      if (!pb.authStore.model?.cliente) {
        setError('Cliente não identificado')
        return
      }

      const clienteId = pb.authStore.model.cliente
      setTenantId(clienteId)
      
      await fetchFornecedores(clienteId, pb)
      
    } catch (error) {
      console.error('Erro ao inicializar página:', error)
      setError('Erro ao carregar fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const fetchFornecedores = async (tenantId: string, pb?: any) => {
    try {
      const vendors = await fetchVendors(tenantId, pb)
      
      // Buscar métricas para cada vendor
      const vendorsComMetricas = await Promise.all(
        vendors.map(async (vendor) => {
          try {
            const analytics = await fetchVendorAnalytics(vendor.id, tenantId, undefined, pb)
            const metricas = analytics[0] // Pegar a mais recente
            
            return {
              ...vendor,
              total_produtos: metricas?.produtos_cadastrados || 0,
              total_vendas: metricas?.vendas_quantidade || 0,
              comissao_total: metricas?.comissao_valor || 0,
              avaliacao_media: metricas?.nota_media || 0
            }
          } catch {
            return {
              ...vendor,
              total_produtos: 0,
              total_vendas: 0,
              comissao_total: 0,
              avaliacao_media: 0
            }
          }
        })
      )
      
      setFornecedores(vendorsComMetricas as any[])
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error)
      throw error
    }
  }

  const handleAprovar = async (vendorId: string) => {
    if (!tenantId) return
    
    try {
      const pb = createTenantPocketBase()
      const userId = pb.authStore.model?.id
      
      if (!userId) {
        alert('Usuário não autenticado')
        return
      }

      await aprovarVendor(vendorId, userId, pb)
      
      // Recarregar a lista
      await fetchFornecedores(tenantId, pb)
      
      alert('Fornecedor aprovado com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar fornecedor:', error)
      alert('Erro ao aprovar fornecedor')
    }
  }

  const handleRejeitar = async (vendorId: string) => {
    if (!tenantId) return
    
    const motivo = prompt('Digite o motivo da rejeição:')
    if (!motivo) return
    
    try {
      const pb = createTenantPocketBase()
      await rejeitarVendor(vendorId, motivo, pb)
      
      // Recarregar a lista
      await fetchFornecedores(tenantId, pb)
      
      alert('Fornecedor rejeitado!')
    } catch (error) {
      console.error('Erro ao rejeitar fornecedor:', error)
      alert('Erro ao rejeitar fornecedor')
    }
  }

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fornecedor.nome_fantasia && fornecedor.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'todos' || fornecedor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Vendor['status']) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pendente_aprovacao':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejeitado':
        return <X className="h-4 w-4 text-red-500" />
      case 'suspenso':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: Vendor['status']) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'pendente_aprovacao':
        return 'Pendente'
      case 'rejeitado':
        return 'Rejeitado'
      case 'suspenso':
        return 'Suspenso'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'pendente_aprovacao':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      case 'suspenso':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar fornecedores</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializePage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Fornecedores</h1>
          <p className="text-gray-600 mt-1">Administre os fornecedores do marketplace</p>
        </div>
        <Link
          href="/admin/fornecedores/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou nome fantasia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro de Status */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Vendor['status'] | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente_aprovacao">Pendente</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{fornecedores.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {fornecedores.filter(f => f.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {fornecedores.filter(f => f.status === 'pendente_aprovacao').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <X className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-gray-900">
                {fornecedores.filter(f => f.status === 'rejeitado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produtos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avaliação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFornecedores.map((fornecedor) => (
                <tr key={fornecedor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {fornecedor.nome}
                        </div>
                        {fornecedor.nome_fantasia && (
                          <div className="text-sm text-gray-500">
                            {fornecedor.nome_fantasia}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {fornecedor.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {fornecedor.documento}
                    </div>
                    <div className="text-sm text-gray-500">
                      {fornecedor.tipo_documento.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fornecedor.status)}`}>
                      {getStatusIcon(fornecedor.status)}
                      <span className="ml-1">{getStatusText(fornecedor.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(fornecedor as any).total_produtos || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(fornecedor as any).total_vendas || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((fornecedor as any).comissao_total || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {((fornecedor as any).avaliacao_media || 0).toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fornecedor.created).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      {fornecedor.status === 'pendente_aprovacao' && (
                        <>
                          <button
                            onClick={() => handleAprovar(fornecedor.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50"
                            title="Aprovar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejeitar(fornecedor.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                            title="Rejeitar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {fornecedor.status === 'rejeitado' && fornecedor.motivo_rejeicao && (
                        <button
                          onClick={() => setShowMotivoRejeicao(showMotivoRejeicao === fornecedor.id ? null : fornecedor.id)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-50"
                          title="Ver motivo da rejeição"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <Link
                        href={`/admin/fornecedores/${fornecedor.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    {/* Motivo da rejeição */}
                    {showMotivoRejeicao === fornecedor.id && fornecedor.motivo_rejeicao && (
                      <div className="absolute right-6 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                        <h4 className="font-medium text-gray-900 mb-2">Motivo da Rejeição:</h4>
                        <p className="text-sm text-gray-600">{fornecedor.motivo_rejeicao}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFornecedores.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou cadastre um novo fornecedor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}