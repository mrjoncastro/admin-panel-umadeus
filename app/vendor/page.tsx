'use client'

import { useEffect, useState } from 'react'
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Eye,
  Star,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { VendorMetricas } from '../../types/marketplace'
import { 
  fetchVendorAnalytics,
  fetchComissoes,
  fetchProdutosMarketplace,
  verificarVendorAuth 
} from '../../lib/services/marketplace'
import { createTenantPocketBase } from '../../lib/pocketbase'

export default function VendorDashboard() {
  const [metrics, setMetrics] = useState<VendorMetricas>({
    totalProdutos: 0,
    totalVendas: 0,
    receitaTotal: 0,
    comissaoPendente: 0,
    avaliacaoMedia: 0,
    totalAvaliacoes: 0,
    produtosAprovados: 0,
    produtosPendentes: 0,
    vendasMes: 0,
    crescimentoMes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const pb = createTenantPocketBase()
      
      // Verificar se o usuário está autenticado
      if (!pb.authStore.model?.id) {
        setError('Usuário não autenticado')
        return
      }

      const userId = pb.authStore.model.id
      const clienteId = pb.authStore.model.cliente
      
      if (!clienteId) {
        setError('Cliente não identificado')
        return
      }

      setTenantId(clienteId)

      // Verificar se o usuário é um vendor ativo
      const vendor = await verificarVendorAuth(userId, clienteId, pb)
      
      if (!vendor) {
        setError('Usuário não é um fornecedor ativo')
        return
      }

      setVendorId(vendor.id)
      
      // Carregar métricas
      await fetchMetrics(vendor.id, clienteId, pb)
      
    } catch (error) {
      console.error('Erro ao inicializar dashboard:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async (vendorId: string, tenantId: string, pb: any) => {
    try {
      // Período atual (mês atual)
      const now = new Date()
      const periodoAtual = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
      const periodoAnterior = now.getMonth() === 0 
        ? `${now.getFullYear() - 1}-12`
        : `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}`

      // Buscar produtos do vendor
      const produtos = await fetchProdutosMarketplace(tenantId, { vendorId }, pb)
      
      // Buscar comissões
      const comissoes = await fetchComissoes(tenantId, { vendorId }, pb)
      const comissoesPendentes = comissoes.filter(c => c.status === 'pendente')
      const comissoesPagas = comissoes.filter(c => c.status === 'paga' || c.status === 'liberada')
      
      // Buscar analytics do período atual
      const analyticsAtual = await fetchVendorAnalytics(vendorId, tenantId, periodoAtual, pb)
      const analyticsAnterior = await fetchVendorAnalytics(vendorId, tenantId, periodoAnterior, pb)
      
      const metricsAtual = analyticsAtual[0]
      const metricsAnterior = analyticsAnterior[0]
      
      // Calcular crescimento
      const vendasMesAtual = metricsAtual?.vendas_quantidade || 0
      const vendasMesAnterior = metricsAnterior?.vendas_quantidade || 0
      const crescimentoMes = vendasMesAnterior > 0 
        ? ((vendasMesAtual - vendasMesAnterior) / vendasMesAnterior) * 100 
        : 0

      // Calcular métricas gerais
      const totalVendas = comissoesPagas.length
      const receitaTotal = comissoesPagas.reduce((sum, c) => sum + c.valor_venda, 0)
      const comissaoPendente = comissoesPendentes.reduce((sum, c) => sum + c.valor_comissao, 0)
      
      const produtosAprovados = produtos.filter(p => p.moderacao_status === 'aprovado').length
      const produtosPendentes = produtos.filter(p => p.moderacao_status === 'pendente').length

      setMetrics({
        totalProdutos: produtos.length,
        totalVendas,
        receitaTotal,
        comissaoPendente,
        avaliacaoMedia: metricsAtual?.nota_media || 0,
        totalAvaliacoes: metricsAtual?.avaliacoes_recebidas || 0,
        produtosAprovados,
        produtosPendentes,
        vendasMes: vendasMesAtual,
        crescimentoMes
      })
      
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
      throw error
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    subtitle,
    trend
  }: {
    title: string
    value: string | number
    icon: any
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
    subtitle?: string
    trend?: number
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200'
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
        {trend !== undefined && (
          <div className="mt-4 flex items-center">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        )}
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeDashboard}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Fornecedor</h1>
        <p className="text-gray-600 mt-1">Visão geral das suas vendas e produtos</p>
      </div>

      {/* Alertas */}
      {metrics.produtosPendentes > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                Produtos Pendentes de Aprovação
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Você tem {metrics.produtosPendentes} produto(s) aguardando aprovação da coordenação.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Produtos"
          value={metrics.totalProdutos}
          icon={Package}
          color="blue"
          subtitle={`${metrics.produtosAprovados} aprovados`}
        />
        
        <StatCard
          title="Vendas Totais"
          value={metrics.totalVendas}
          icon={ShoppingCart}
          color="green"
          subtitle={`${metrics.vendasMes} neste mês`}
          trend={metrics.crescimentoMes}
        />
        
        <StatCard
          title="Receita Total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(metrics.receitaTotal)}
          icon={DollarSign}
          color="purple"
        />
        
        <StatCard
          title="Comissão Pendente"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(metrics.comissaoPendente)}
          icon={TrendingUp}
          color="orange"
          subtitle="Aguardando liberação"
        />
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Avaliação Média"
          value={metrics.avaliacaoMedia > 0 ? `${metrics.avaliacaoMedia.toFixed(1)}/5.0` : 'N/A'}
          icon={Star}
          color="green"
          subtitle={`${metrics.totalAvaliacoes} avaliações`}
        />
        
        <StatCard
          title="Produtos Ativos"
          value={metrics.produtosAprovados}
          icon={Eye}
          color="blue"
          subtitle="Visíveis na loja"
        />
        
        <StatCard
          title="Pendentes Aprovação"
          value={metrics.produtosPendentes}
          icon={AlertCircle}
          color={metrics.produtosPendentes > 0 ? 'orange' : 'green'}
          subtitle="Aguardando análise"
        />
      </div>

      {/* Ações rápidas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/vendor/produtos/novo'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Adicionar Produto</h3>
            <p className="text-sm text-gray-600">Cadastre um novo produto</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/vendor/produtos'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Produtos</h3>
            <p className="text-sm text-gray-600">Gerencie seus produtos</p>
          </button>
          
          <button 
            onClick={() => window.location.href = '/vendor/comissoes'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Comissões</h3>
            <p className="text-sm text-gray-600">Acompanhe suas comissões</p>
          </button>
        </div>
      </div>

      {/* Últimas atividades */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Atividades</h2>
        <div className="space-y-3">
          {vendorId ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Sistema de atividades será implementado em breve</p>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Carregando atividades...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}