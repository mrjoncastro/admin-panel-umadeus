'use client'

import { useState, useEffect } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  MessageSquare,
  Filter,
  Search,
  Star,
  MapPin,
  Calendar
} from 'lucide-react'
import type { 
  SolicitacaoAprovacao, 
  DashboardAprovacoes,
  NivelVisibilidade,
  StatusAutorizacao
} from '../../../../types/product-visibility'

export default function DashboardAprovacoesProdutos() {
  const [dashboard, setDashboard] = useState<DashboardAprovacoes | null>(null)
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<SolicitacaoAprovacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    nivel: '' as NivelVisibilidade | '',
    status: '' as StatusAutorizacao | '',
    busca: '',
    dataInicio: '',
    dataFim: ''
  })
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoAprovacao | null>(null)
  const [modalAprovacao, setModalAprovacao] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [filtros])

  async function carregarDados() {
    setLoading(true)
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        setDashboard(getMockDashboard())
        setSolicitacoesPendentes(getMockSolicitacoes())
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoading(false)
    }
  }

  async function processarAprovacao(
    solicitacaoId: string, 
    acao: 'aprovar' | 'rejeitar',
    comentarios?: string
  ) {
    try {
      console.log('Processando aprovação:', { solicitacaoId, acao, comentarios })
      
      // Atualizar lista local
      setSolicitacoesPendentes(prev => 
        prev.filter(s => s.id !== solicitacaoId)
      )
      
      setModalAprovacao(false)
      setSolicitacaoSelecionada(null)
      
      // Recarregar dashboard
      carregarDados()
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    }
  }

  function abrirModalAprovacao(solicitacao: SolicitacaoAprovacao) {
    setSolicitacaoSelecionada(solicitacao)
    setModalAprovacao(true)
  }

  const solicitacoesFiltradas = solicitacoesPendentes.filter(solicitacao => {
    if (filtros.nivel && solicitacao.nivel_solicitado !== filtros.nivel) return false
    if (filtros.status && solicitacao.status !== filtros.status) return false
    if (filtros.busca && !solicitacao.produto_info.nome.toLowerCase().includes(filtros.busca.toLowerCase())) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aprovações de Visibilidade</h1>
          <p className="text-gray-600">Gerencie solicitações de ampliação de visibilidade de produtos</p>
        </div>
        
        <div className="text-sm text-gray-500">
          Última atualização: {dashboard && new Date(dashboard.data_atualizacao).toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Cards de Resumo */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.pendentes_aprovacao}</p>
                {dashboard.aguardando_resposta > 0 && (
                  <p className="text-xs text-red-600">
                    {dashboard.aguardando_resposta} há mais de 24h
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovadas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.aprovadas_hoje}</p>
                <p className="text-xs text-gray-500">
                  Taxa: {dashboard.taxa_aprovacao.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejeitadas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.rejeitadas_hoje}</p>
                <p className="text-xs text-gray-500">
                  Tempo médio: {dashboard.tempo_medio_aprovacao.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((dashboard.aprovadas_hoje / (dashboard.aprovadas_hoje + dashboard.rejeitadas_hoje || 1)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500">Taxa de aprovação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={filtros.busca}
              onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <select
            value={filtros.nivel}
            onChange={(e) => setFiltros({...filtros, nivel: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos os níveis</option>
            <option value="regiao">Região</option>
            <option value="estado">Estado</option>
            <option value="nacional">Nacional</option>
          </select>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value as any})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-400">até</span>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Solicitações Pendentes ({solicitacoesFiltradas.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {solicitacoesFiltradas.map((solicitacao) => (
            <div key={solicitacao.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {solicitacao.produto_info.nome}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      solicitacao.nivel_solicitado === 'regiao' ? 'bg-blue-100 text-blue-800' :
                      solicitacao.nivel_solicitado === 'estado' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {solicitacao.nivel_solicitado === 'regiao' ? 'Regional' :
                       solicitacao.nivel_solicitado === 'estado' ? 'Estadual' :
                       'Nacional'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isUrgent(solicitacao.created) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getTimeAgo(solicitacao.created)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Categoria</p>
                      <p className="font-medium">{solicitacao.produto_info.categoria}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preço</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(solicitacao.produto_info.preco)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendas (último mês)</p>
                      <p className="font-medium">{solicitacao.produto_info.performance_atual.vendas_ultimo_mes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        {solicitacao.produto_info.performance_atual.avaliacao_media.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({solicitacao.produto_info.performance_atual.total_avaliacoes} avaliações)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {solicitacao.nivel_atual} → {solicitacao.nivel_solicitado}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <p className="text-sm text-gray-600 mb-1">Justificativa:</p>
                    <p className="text-sm">{solicitacao.justificativa}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => abrirModalAprovacao(solicitacao)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Analisar
                  </button>
                  
                  <button
                    onClick={() => processarAprovacao(solicitacao.id, 'aprovar')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprovar
                  </button>
                  
                  <button
                    onClick={() => processarAprovacao(solicitacao.id, 'rejeitar')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {solicitacoesFiltradas.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-600">
                Não há solicitações pendentes que correspondam aos filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aprovação Detalhada */}
      {modalAprovacao && solicitacaoSelecionada && (
        <ModalAprovacao
          solicitacao={solicitacaoSelecionada}
          onAprovar={(comentarios) => processarAprovacao(solicitacaoSelecionada.id, 'aprovar', comentarios)}
          onRejeitar={(comentarios) => processarAprovacao(solicitacaoSelecionada.id, 'rejeitar', comentarios)}
          onFechar={() => setModalAprovacao(false)}
        />
      )}
    </div>
  )
}

// Modal de Aprovação Detalhada
function ModalAprovacao({ 
  solicitacao, 
  onAprovar, 
  onRejeitar, 
  onFechar 
}: {
  solicitacao: SolicitacaoAprovacao
  onAprovar: (comentarios?: string) => void
  onRejeitar: (comentarios?: string) => void
  onFechar: () => void
}) {
  const [comentarios, setComentarios] = useState('')
  const [acao, setAcao] = useState<'aprovar' | 'rejeitar' | null>(null)

  function confirmarAcao() {
    if (acao === 'aprovar') {
      onAprovar(comentarios)
    } else if (acao === 'rejeitar') {
      onRejeitar(comentarios)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Análise Detalhada da Solicitação</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Produto */}
          <div>
            <h4 className="font-semibold mb-3">Informações do Produto</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Nome:</span>
                  <p className="font-medium">{solicitacao.produto_info.nome}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Categoria:</span>
                  <p className="font-medium">{solicitacao.produto_info.categoria}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Preço:</span>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(solicitacao.produto_info.preco)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Vendas (último mês):</span>
                  <p className="font-medium">{solicitacao.produto_info.performance_atual.vendas_ultimo_mes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div>
            <h4 className="font-semibold mb-3">Performance</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {solicitacao.produto_info.performance_atual.vendas_ultimo_mes}
                </div>
                <div className="text-sm text-blue-600">Vendas</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {solicitacao.produto_info.performance_atual.avaliacao_media.toFixed(1)}
                </div>
                <div className="text-sm text-yellow-600">Avaliação</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {solicitacao.produto_info.performance_atual.total_avaliacoes}
                </div>
                <div className="text-sm text-green-600">Reviews</div>
              </div>
            </div>
          </div>

          {/* Solicitação */}
          <div>
            <h4 className="font-semibold mb-3">Detalhes da Solicitação</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-gray-600">Nível atual:</span>
                  <p className="font-medium capitalize">{solicitacao.nivel_atual}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Nível solicitado:</span>
                  <p className="font-medium capitalize">{solicitacao.nivel_solicitado}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Justificativa:</span>
                <p className="mt-1">{solicitacao.justificativa}</p>
              </div>
            </div>
          </div>

          {/* Comentários */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentários da análise
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Adicione seus comentários sobre a análise..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onFechar}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => setAcao('rejeitar')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Rejeitar
          </button>
          <button
            onClick={() => setAcao('aprovar')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Aprovar
          </button>
        </div>

        {acao && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">
                Confirmar {acao === 'aprovar' ? 'aprovação' : 'rejeição'}?
              </span>
              <button
                onClick={confirmarAcao}
                className={`px-4 py-2 text-white rounded-lg ${
                  acao === 'aprovar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
              <button
                onClick={() => setAcao(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Funções auxiliares
function isUrgent(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return diffHours > 48
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}d atrás`
  } else {
    return `${diffHours}h atrás`
  }
}

// Mock data
function getMockDashboard(): DashboardAprovacoes {
  return {
    usuario_id: '1',
    nivel_hierarquia: 'coordenador_regional',
    pendentes_aprovacao: 12,
    aprovadas_hoje: 8,
    rejeitadas_hoje: 2,
    aguardando_resposta: 3,
    produtos_por_status: {
      pendente: 12,
      aprovado: 45,
      rejeitado: 8,
      automatico: 23
    },
    tempo_medio_aprovacao: 18.5,
    taxa_aprovacao: 85.2,
    produtos_mais_solicitados: [],
    vendedores_mais_ativos: [],
    data_atualizacao: new Date().toISOString()
  }
}

function getMockSolicitacoes(): SolicitacaoAprovacao[] {
  return [
    {
      id: '1',
      produto_id: 'prod_1',
      produto_visibilidade_id: 'vis_1',
      solicitante_id: 'user_1',
      nivel_atual: 'cidade',
      nivel_solicitado: 'regiao',
      justificativa: 'Produto tem alta demanda em cidades vizinhas da região. Vendas cresceram 150% no último mês.',
      aprovador_necessario: 'coordenador_regional',
      status: 'pendente',
      produto_info: {
        nome: 'Smartphone Galaxy Premium',
        categoria: 'Eletrônicos',
        preco: 2599.99,
        vendedor: 'TechStore SP',
        performance_atual: {
          vendas_ultimo_mes: 45,
          avaliacao_media: 4.7,
          total_avaliacoes: 89
        }
      },
      created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      produto_id: 'prod_2',
      produto_visibilidade_id: 'vis_2',
      solicitante_id: 'user_2',
      nivel_atual: 'regiao',
      nivel_solicitado: 'estado',
      justificativa: 'Produto inovador sem concorrência no estado. Potencial de vendas muito alto em outras regiões.',
      aprovador_necessario: 'coordenador_geral',
      status: 'pendente',
      produto_info: {
        nome: 'Kit de Energia Solar Residencial',
        categoria: 'Sustentabilidade',
        preco: 8999.99,
        vendedor: 'EcoSolar Brasil',
        performance_atual: {
          vendas_ultimo_mes: 23,
          avaliacao_media: 4.9,
          total_avaliacoes: 156
        }
      },
      created: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      produto_id: 'prod_3',
      produto_visibilidade_id: 'vis_3',
      solicitante_id: 'user_3',
      nivel_atual: 'cidade',
      nivel_solicitado: 'regiao',
      justificativa: 'Curso online tem alta procura em toda a região metropolitana.',
      aprovador_necessario: 'coordenador_regional',
      status: 'pendente',
      produto_info: {
        nome: 'Curso de Marketing Digital Avançado',
        categoria: 'Educação',
        preco: 497.00,
        vendedor: 'EduTech Academy',
        performance_atual: {
          vendas_ultimo_mes: 67,
          avaliacao_media: 4.8,
          total_avaliacoes: 234
        }
      },
      created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ]
}