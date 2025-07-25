'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Building2,
  Award,
  DollarSign
} from 'lucide-react'
import type { DashboardData, NivelHierarquia } from '../../../../types/hierarchy'

interface MetricCard {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

export default function HierarchyDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [nivelSelecionado, setNivelSelecionado] = useState<NivelHierarquia>('coordenador_geral')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDashboard()
  }, [nivelSelecionado])

  async function carregarDashboard() {
    setLoading(true)
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        setDashboardData(getMockDashboardData(nivelSelecionado))
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      setLoading(false)
    }
  }

  const metricsCards: MetricCard[] = [
    {
      title: 'Vendas do Mês',
      value: dashboardData?.metricas_nivel?.vendas_quantidade || 0,
      change: '+12%',
      trend: 'up',
      icon: BarChart3
    },
    {
      title: 'Receita Total',
      value: `R$ ${(dashboardData?.metricas_nivel?.vendas_valor || 0).toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Comissões Recebidas',
      value: `R$ ${(dashboardData?.metricas_nivel?.comissoes_recebidas || 0).toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      icon: Award
    },
    {
      title: 'Líderes Ativos',
      value: dashboardData?.metricas_nivel?.lideres_ativos || 0,
      change: '+3%',
      trend: 'up',
      icon: Users
    }
  ]

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Hierárquico</h1>
          <p className="text-gray-600">Visão geral da estrutura territorial e performance</p>
        </div>
        
        <select
          value={nivelSelecionado}
          onChange={(e) => setNivelSelecionado(e.target.value as NivelHierarquia)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="coordenador_geral">Coordenador Geral</option>
          <option value="coordenador_regional">Coordenador Regional</option>
          <option value="lider_local">Líder Local</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`h-4 w-4 ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ml-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Estrutura Hierárquica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estrutura Territorial */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estrutura Territorial</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium">Estados</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {dashboardData?.metricas_subordinados?.total_regioes || 27}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Regiões</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {dashboardData?.metricas_subordinados?.total_cidades || 184}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium">Líderes Locais</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {dashboardData?.metricas_subordinados?.total_lideres || 1247}
              </span>
            </div>
          </div>
        </div>

        {/* Performance por Região */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Regiões</h3>
          
          <div className="space-y-3">
            {(dashboardData?.metricas_subordinados?.performance_por_regiao || getMockPerformance()).map((regiao, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{regiao.nome}</p>
                  <p className="text-sm text-gray-600">Meta: {regiao.percentual_meta}%</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">R$ {regiao.vendas.toLocaleString()}</p>
                  <div className={`text-sm ${
                    regiao.percentual_meta >= 100 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {regiao.percentual_meta >= 100 ? '✓ Meta atingida' : 'Abaixo da meta'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas e Notificações */}
      {dashboardData?.alertas && dashboardData.alertas.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Notificações</h3>
          
          <div className="space-y-3">
            {dashboardData.alertas.map((alerta, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alerta.nivel_urgencia === 'alta' ? 'bg-red-50 border-red-400' :
                alerta.nivel_urgencia === 'media' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${
                      alerta.nivel_urgencia === 'alta' ? 'text-red-800' :
                      alerta.nivel_urgencia === 'media' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alerta.tipo.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-gray-700 mt-1">{alerta.mensagem}</p>
                  </div>
                  {alerta.link_acao && (
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Ação
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking de Performance */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ranking de Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comissões
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(dashboardData?.ranking_performance || getMockRanking()).map((item, index) => (
                <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.posicao}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {item.nivel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.vendas.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.comissoes.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Mock data functions
function getMockDashboardData(nivel: NivelHierarquia): DashboardData {
  return {
    nivel_usuario: nivel,
    periodo: new Date().toISOString().slice(0, 7),
    metricas_nivel: {
      vendas_quantidade: Math.floor(Math.random() * 500) + 100,
      vendas_valor: Math.floor(Math.random() * 100000) + 50000,
      comissoes_recebidas: Math.floor(Math.random() * 15000) + 5000,
      produtos_ativos: Math.floor(Math.random() * 50) + 20,
      lideres_ativos: Math.floor(Math.random() * 100) + 50
    },
    metricas_subordinados: {
      total_regioes: 27,
      total_cidades: 184,
      total_lideres: 1247
    },
    alertas: [
      {
        tipo: 'meta_baixa',
        mensagem: 'Região Sudeste está 15% abaixo da meta mensal',
        nivel_urgencia: 'media',
        link_acao: '/admin/hierarchy/regioes/sudeste'
      },
      {
        tipo: 'aprovacao_pendente',
        mensagem: '8 produtos aguardando aprovação',
        nivel_urgencia: 'alta',
        link_acao: '/admin/marketplace/produtos?status=pendente'
      }
    ]
  }
}

function getMockPerformance() {
  return [
    { regiao_id: '1', nome: 'São Paulo Capital', vendas: 125000, meta: 100000, percentual_meta: 125 },
    { regiao_id: '2', nome: 'Rio de Janeiro', vendas: 98000, meta: 95000, percentual_meta: 103 },
    { regiao_id: '3', nome: 'Belo Horizonte', vendas: 87000, meta: 90000, percentual_meta: 97 },
    { regiao_id: '4', nome: 'Porto Alegre', vendas: 76000, meta: 80000, percentual_meta: 95 },
    { regiao_id: '5', nome: 'Salvador', vendas: 65000, meta: 70000, percentual_meta: 93 }
  ]
}

function getMockRanking() {
  return [
    { id: '1', nome: 'João Silva', nivel: 'coordenador_regional' as NivelHierarquia, vendas: 45000, comissoes: 6750, posicao: 1 },
    { id: '2', nome: 'Maria Santos', nivel: 'lider_local' as NivelHierarquia, vendas: 38000, comissoes: 5700, posicao: 2 },
    { id: '3', nome: 'Pedro Costa', nivel: 'coordenador_regional' as NivelHierarquia, vendas: 32000, comissoes: 4800, posicao: 3 },
    { id: '4', nome: 'Ana Oliveira', nivel: 'lider_local' as NivelHierarquia, vendas: 28000, comissoes: 4200, posicao: 4 },
    { id: '5', nome: 'Carlos Lima', nivel: 'lider_local' as NivelHierarquia, vendas: 25000, comissoes: 3750, posicao: 5 }
  ]
}