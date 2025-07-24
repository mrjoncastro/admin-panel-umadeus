'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import type { VendedorDashboard } from '@/types'

export default function VendedorDashboardPage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<VendedorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/vendedores/dashboard')
      
      if (res.status === 401) {
        router.push('/vendedores/login')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar dashboard')
      }

      setDashboard(data)
    } catch (err) {
      logger.error('Erro ao carregar dashboard:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/vendedores/auth/logout', { method: 'POST' })
      router.push('/vendedores/login')
    } catch (err) {
      logger.error('Erro no logout:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const { vendedor, estatisticas_hoje, estatisticas_mes, crescimento } = dashboard

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Portal do Vendedor
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {dashboard.notificacoes_nao_lidas > 0 && (
                <Link 
                  href="/vendedores/notificacoes"
                  className="relative p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dashboard.notificacoes_nao_lidas}
                  </span>
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Olá, {vendedor.nome}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vendas hoje */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {(estatisticas_hoje.vendas_valor || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {estatisticas_hoje.vendas_quantidade || 0} pedidos
                </p>
              </div>
            </div>
          </div>

          {/* Vendas mês */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas do Mês</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {(estatisticas_mes.vendas_valor || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {crescimento.vendas > 0 ? '+' : ''}{crescimento.vendas.toFixed(1)}% vs mês anterior
                </p>
              </div>
            </div>
          </div>

          {/* Comissões */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comissões do Mês</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {(estatisticas_mes.comissoes_valor || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Taxa: {vendedor.taxa_comissao}%
                </p>
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendedor.total_produtos}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboard.produtos_pendentes.length} pendentes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pedidos pendentes */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pedidos Pendentes</h3>
            </div>
            <div className="p-6">
              {dashboard.pedidos_pendentes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum pedido pendente</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.pedidos_pendentes.slice(0, 5).map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {pedido.expand?.produto?.nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pedido.expand?.pedido?.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          R$ {pedido.valor_produto.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pedido.status === 'pendente' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pedido.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(pedido.created!).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dashboard.pedidos_pendentes.length > 5 && (
                    <Link 
                      href="/vendedores/pedidos"
                      className="block text-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver todos os pedidos
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Produtos pendentes */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Produtos Pendentes de Aprovação</h3>
            </div>
            <div className="p-6">
              {dashboard.produtos_pendentes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum produto pendente</p>
              ) : (
                <div className="space-y-4">
                  {dashboard.produtos_pendentes.map((produto) => (
                    <div key={produto.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{produto.nome}</p>
                        <p className="text-sm text-gray-600">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Em análise
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(produto.created!).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/vendedores/produtos"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver todos os produtos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/vendedores/produtos/novo"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Novo Produto</span>
            </Link>

            <Link 
              href="/vendedores/pedidos"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Meus Pedidos</span>
            </Link>

            <Link 
              href="/vendedores/produtos"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Meus Produtos</span>
            </Link>

            <Link 
              href="/vendedores/financeiro"
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Financeiro</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}