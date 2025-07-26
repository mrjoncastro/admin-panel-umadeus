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
  Clock
} from 'lucide-react'
import Link from 'next/link'

type FornecedorStatus = 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'

type Fornecedor = {
  id: string
  nome: string
  nome_fantasia?: string
  documento: string
  tipo_documento: 'cpf' | 'cnpj'
  email: string
  telefone: string
  cidade: string
  estado: string
  status: FornecedorStatus
  data_cadastro: string
  data_aprovacao?: string
  aprovado_por?: string
  total_produtos: number
  total_vendas: number
  comissao_total: number
  avaliacao_media: number
  motivo_rejeicao?: string
}

export default function AdminFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FornecedorStatus | 'todos'>('todos')
  const [showApprovalModal, setShowApprovalModal] = useState<string | null>(null)
  const [modalAction, setModalAction] = useState<'aprovar' | 'rejeitar'>('aprovar')
  const [motivoRejeicao, setMotivoRejeicao] = useState('')

  useEffect(() => {
    fetchFornecedores()
  }, [])

  const fetchFornecedores = async () => {
    try {
      setLoading(true)
      // Simular dados
      setTimeout(() => {
        setFornecedores([
          {
            id: '1',
            nome: 'João Silva',
            nome_fantasia: 'Silva Produtos Personalizados',
            documento: '123.456.789-00',
            tipo_documento: 'cpf',
            email: 'joao@silva.com',
            telefone: '(11) 99999-9999',
            cidade: 'São Paulo',
            estado: 'SP',
            status: 'ativo',
            data_cadastro: '2024-01-01',
            data_aprovacao: '2024-01-05',
            aprovado_por: 'Admin',
            total_produtos: 15,
            total_vendas: 234,
            comissao_total: 2450.80,
            avaliacao_media: 4.7
          },
          {
            id: '2',
            nome: 'Maria Santos',
            nome_fantasia: 'Maria Artes',
            documento: '987.654.321-00',
            tipo_documento: 'cpf',
            email: 'maria@artes.com',
            telefone: '(21) 88888-8888',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            status: 'pendente_aprovacao',
            data_cadastro: '2024-01-25',
            total_produtos: 0,
            total_vendas: 0,
            comissao_total: 0,
            avaliacao_media: 0
          },
          {
            id: '3',
            nome: 'Carlos Oliveira',
            nome_fantasia: 'CO Produtos',
            documento: '12.345.678/0001-90',
            tipo_documento: 'cnpj',
            email: 'carlos@co.com.br',
            telefone: '(31) 77777-7777',
            cidade: 'Belo Horizonte',
            estado: 'MG',
            status: 'rejeitado',
            data_cadastro: '2024-01-20',
            total_produtos: 0,
            total_vendas: 0,
            comissao_total: 0,
            avaliacao_media: 0,
            motivo_rejeicao: 'Documentos incompletos'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
      setLoading(false)
    }
  }

  const handleApproval = async (fornecedorId: string, action: 'aprovar' | 'rejeitar') => {
    try {
      console.log(`${action} fornecedor ${fornecedorId}`, motivoRejeicao)
      // Implementar lógica de aprovação/rejeição
      setShowApprovalModal(null)
      setMotivoRejeicao('')
      // Recarregar dados
      fetchFornecedores()
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    }
  }

  const getStatusColor = (status: FornecedorStatus) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'pendente_aprovacao':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspenso':
        return 'bg-red-100 text-red-800'
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: FornecedorStatus) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'pendente_aprovacao':
        return 'Pendente'
      case 'suspenso':
        return 'Suspenso'
      case 'rejeitado':
        return 'Rejeitado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: FornecedorStatus) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />
      case 'pendente_aprovacao':
        return <Clock className="h-4 w-4" />
      case 'suspenso':
      case 'rejeitado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = 
      fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fornecedor.nome_fantasia && fornecedor.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'todos' || fornecedor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue'
  }: {
    title: string
    value: string | number
    icon: any
    color?: 'blue' | 'green' | 'orange' | 'purple'
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie e aprove fornecedores do marketplace</p>
        </div>
        <Link
          href="/admin/fornecedores/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Fornecedores"
          value={fornecedores.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Ativos"
          value={fornecedores.filter(f => f.status === 'ativo').length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pendentes"
          value={fornecedores.filter(f => f.status === 'pendente_aprovacao').length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Rejeitados"
          value={fornecedores.filter(f => f.status === 'rejeitado').length}
          icon={AlertCircle}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FornecedorStatus | 'todos')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente_aprovacao">Pendente</option>
              <option value="suspenso">Suspenso</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de fornecedores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredFornecedores.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fornecedor encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Ainda não há fornecedores cadastrados.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
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
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{fornecedor.nome}</div>
                          {fornecedor.nome_fantasia && (
                            <div className="text-sm text-gray-500">{fornecedor.nome_fantasia}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            {fornecedor.tipo_documento.toUpperCase()}: {fornecedor.documento}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {fornecedor.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {fornecedor.telefone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {fornecedor.cidade}, {fornecedor.estado}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(fornecedor.data_cadastro).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fornecedor.status)}`}>
                        {getStatusIcon(fornecedor.status)}
                        {getStatusText(fornecedor.status)}
                      </span>
                      {fornecedor.status === 'rejeitado' && fornecedor.motivo_rejeicao && (
                        <div className="text-xs text-red-600 mt-1">
                          {fornecedor.motivo_rejeicao}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        {fornecedor.total_produtos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{fornecedor.total_vendas}</div>
                      {fornecedor.comissao_total > 0 && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(fornecedor.comissao_total)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        {fornecedor.status === 'pendente_aprovacao' && (
                          <>
                            <button 
                              onClick={() => {
                                setShowApprovalModal(fornecedor.id)
                                setModalAction('aprovar')
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setShowApprovalModal(fornecedor.id)
                                setModalAction('rejeitar')
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de aprovação/rejeição */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalAction === 'aprovar' ? 'Aprovar' : 'Rejeitar'} Fornecedor
              </h3>
              <button
                onClick={() => setShowApprovalModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {modalAction === 'aprovar' 
                  ? 'Tem certeza que deseja aprovar este fornecedor? Ele poderá cadastrar produtos e receber comissões.'
                  : 'Informe o motivo da rejeição para que o fornecedor possa corrigir os problemas:'
                }
              </p>

              {modalAction === 'rejeitar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da rejeição
                  </label>
                  <textarea
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva o motivo da rejeição..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleApproval(showApprovalModal, modalAction)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    modalAction === 'aprovar'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {modalAction === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}