'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Download,
  Calendar,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

type ComissaoStatus = 'pendente' | 'liberada' | 'paga' | 'cancelada'
type SaqueStatus = 'solicitado' | 'processando' | 'pago' | 'cancelado'

type Comissao = {
  id: string
  produto_nome: string
  pedido_id: string
  valor_venda: number
  percentual_comissao: number
  valor_comissao: number
  status: ComissaoStatus
  data_venda: string
  data_liberacao?: string
  data_pagamento?: string
  cliente_nome: string
}

type Saque = {
  id: string
  valor_solicitado: number
  valor_liquido: number
  taxa_saque: number
  status: SaqueStatus
  data_solicitacao: string
  data_processamento?: string
  data_pagamento?: string
  forma_pagamento: string
  comprovante?: string
}

export default function VendorComissoes() {
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [saques, setSaques] = useState<Saque[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comissoes')
  const [statusFilter, setStatusFilter] = useState<ComissaoStatus | 'todas'>('todas')
  const [showSaqueModal, setShowSaqueModal] = useState(false)

  // Métricas
  const totalComissoes = comissoes.reduce((acc, c) => acc + c.valor_comissao, 0)
  const comissoesPendentes = comissoes.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor_comissao, 0)
  const comissoesLiberadas = comissoes.filter(c => c.status === 'liberada').reduce((acc, c) => acc + c.valor_comissao, 0)
  const comissoesPagas = comissoes.filter(c => c.status === 'paga').reduce((acc, c) => acc + c.valor_comissao, 0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Simular dados
      setTimeout(() => {
        setComissoes([
          {
            id: '1',
            produto_nome: 'Kit Jovem Premium',
            pedido_id: 'PED-001',
            valor_venda: 65.00,
            percentual_comissao: 25,
            valor_comissao: 16.25,
            status: 'paga',
            data_venda: '2024-01-15',
            data_liberacao: '2024-01-20',
            data_pagamento: '2024-01-25',
            cliente_nome: 'Maria Silva'
          },
          {
            id: '2',
            produto_nome: 'Camiseta Básica',
            pedido_id: 'PED-002',
            valor_venda: 35.00,
            percentual_comissao: 25,
            valor_comissao: 8.75,
            status: 'liberada',
            data_venda: '2024-01-18',
            data_liberacao: '2024-01-23',
            cliente_nome: 'João Santos'
          },
          {
            id: '3',
            produto_nome: 'Kit Infantil',
            pedido_id: 'PED-003',
            valor_venda: 45.00,
            percentual_comissao: 25,
            valor_comissao: 11.25,
            status: 'pendente',
            data_venda: '2024-01-20',
            cliente_nome: 'Ana Costa'
          }
        ])

        setSaques([
          {
            id: '1',
            valor_solicitado: 150.00,
            valor_liquido: 145.00,
            taxa_saque: 5.00,
            status: 'pago',
            data_solicitacao: '2024-01-20',
            data_processamento: '2024-01-22',
            data_pagamento: '2024-01-25',
            forma_pagamento: 'PIX',
            comprovante: 'COMP-123456'
          },
          {
            id: '2',
            valor_solicitado: 85.00,
            valor_liquido: 80.00,
            taxa_saque: 5.00,
            status: 'processando',
            data_solicitacao: '2024-01-25',
            data_processamento: '2024-01-26',
            forma_pagamento: 'PIX'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: ComissaoStatus | SaqueStatus) => {
    switch (status) {
      case 'paga':
      case 'pago':
        return 'bg-green-100 text-green-800'
      case 'liberada':
      case 'processando':
        return 'bg-blue-100 text-blue-800'
      case 'pendente':
      case 'solicitado':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelada':
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ComissaoStatus | SaqueStatus) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'liberada':
        return 'Liberada'
      case 'paga':
        return 'Paga'
      case 'cancelada':
        return 'Cancelada'
      case 'solicitado':
        return 'Solicitado'
      case 'processando':
        return 'Processando'
      case 'pago':
        return 'Pago'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: ComissaoStatus | SaqueStatus) => {
    switch (status) {
      case 'paga':
      case 'pago':
        return <CheckCircle className="h-4 w-4" />
      case 'liberada':
      case 'processando':
        return <Clock className="h-4 w-4" />
      case 'pendente':
      case 'solicitado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const filteredComissoes = comissoes.filter(comissao => 
    statusFilter === 'todas' || comissao.status === statusFilter
  )

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    subtitle
  }: {
    title: string
    value: string | number
    icon: any
    color?: 'blue' | 'green' | 'orange' | 'purple'
    subtitle?: string
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
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
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
          <h1 className="text-2xl font-bold text-gray-900">Comissões e Saques</h1>
          <p className="text-gray-600 mt-1">Acompanhe seus ganhos e solicite saques</p>
        </div>
        <button
          onClick={() => setShowSaqueModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Solicitar Saque
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Comissões"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalComissoes)}
          icon={DollarSign}
          color="blue"
        />
        
        <StatCard
          title="Pendentes"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(comissoesPendentes)}
          icon={Clock}
          color="orange"
          subtitle="Aguardando liberação"
        />
        
        <StatCard
          title="Liberadas"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(comissoesLiberadas)}
          icon={TrendingUp}
          color="purple"
          subtitle="Disponíveis para saque"
        />
        
        <StatCard
          title="Pagas"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(comissoesPagas)}
          icon={CheckCircle}
          color="green"
          subtitle="Já recebidas"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'comissoes', label: 'Comissões', icon: DollarSign },
            { id: 'saques', label: 'Saques', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === 'comissoes' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ComissaoStatus | 'todas')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="liberada">Liberada</option>
                <option value="paga">Paga</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Lista de comissões */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Venda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComissoes.map((comissao) => (
                    <tr key={comissao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{comissao.produto_nome}</div>
                        <div className="text-sm text-gray-500">Cliente: {comissao.cliente_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {comissao.pedido_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(comissao.valor_venda)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(comissao.valor_comissao)}
                        </div>
                        <div className="text-sm text-gray-500">{comissao.percentual_comissao}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comissao.status)}`}>
                          {getStatusIcon(comissao.status)}
                          {getStatusText(comissao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(comissao.data_venda).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saques' && (
        <div className="space-y-4">
          {/* Lista de saques */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Solicitado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Líquido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Solicitação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Forma Pagamento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {saques.map((saque) => (
                    <tr key={saque.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saque.valor_solicitado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saque.taxa_saque)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(saque.valor_liquido)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(saque.status)}`}>
                          {getStatusIcon(saque.status)}
                          {getStatusText(saque.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(saque.data_solicitacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          {saque.forma_pagamento}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de solicitar saque */}
      {showSaqueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Solicitar Saque</h3>
              <button
                onClick={() => setShowSaqueModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Valor disponível:</span>
                  <span className="text-lg font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(comissoesLiberadas)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do saque
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={comissoesLiberadas}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>• Taxa de saque: R$ 5,00</p>
                <p>• Processamento: 1-2 dias úteis</p>
                <p>• Valor mínimo: R$ 20,00</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaqueModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Solicitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}