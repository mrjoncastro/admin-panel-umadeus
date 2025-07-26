'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Check,
  X,
  Clock,
  User,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from 'lucide-react'

type UserRole = 'coordenador' | 'lider' | 'fornecedor'
type ProdutoStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'revisao'

type ProdutoPendente = {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagem?: string
  vendor_id: string
  vendor_nome: string
  vendor_nome_fantasia?: string
  origem: 'admin' | 'vendor'
  created_by: string
  created_by_role: UserRole
  moderacao_status: ProdutoStatus
  data_criacao: string
  data_submissao: string
  motivo_rejeicao?: string
  observacoes_internas?: string
  requer_inscricao_aprovada: boolean
  destaque: boolean
}

export default function AprovacaoProdutos() {
  const [userRole, setUserRole] = useState<UserRole>('coordenador') // Simular role do usuário
  const [produtos, setProdutos] = useState<ProdutoPendente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProdutoStatus | 'todos'>('pendente')
  const [origemFilter, setOrigemFilter] = useState<'admin' | 'vendor' | 'todos'>('todos')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [modalAction, setModalAction] = useState<'aprovar' | 'rejeitar' | 'revisar'>('aprovar')
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    fetchProdutosPendentes()
  }, [])

  const fetchProdutosPendentes = async () => {
    try {
      setLoading(true)
      // Simular dados
      setTimeout(() => {
        setProdutos([
          {
            id: '1',
            nome: 'Kit Jovem Premium Plus',
            descricao: 'Kit completo para jovens com camiseta, boné e adesivos personalizados',
            preco: 67.90,
            categoria: 'Kits',
            imagem: '/produtos/kit-jovem-plus.jpg',
            vendor_id: 'vendor1',
            vendor_nome: 'João Silva',
            vendor_nome_fantasia: 'Silva Produtos',
            origem: 'vendor',
            created_by: 'vendor1',
            created_by_role: 'fornecedor',
            moderacao_status: 'pendente',
            data_criacao: '2024-01-25T10:30:00Z',
            data_submissao: '2024-01-25T14:20:00Z',
            requer_inscricao_aprovada: false,
            destaque: false
          },
          {
            id: '2',
            nome: 'Camiseta Personalizada M24',
            descricao: 'Camiseta 100% algodão com estampa exclusiva do ministério',
            preco: 39.90,
            categoria: 'Camisetas',
            vendor_id: 'vendor2',
            vendor_nome: 'Maria Santos',
            vendor_nome_fantasia: 'Maria Artes',
            origem: 'vendor',
            created_by: 'vendor2',
            created_by_role: 'fornecedor',
            moderacao_status: 'pendente',
            data_criacao: '2024-01-24T16:45:00Z',
            data_submissao: '2024-01-24T17:00:00Z',
            requer_inscricao_aprovada: true,
            destaque: false
          },
          {
            id: '3',
            nome: 'Caneca Motivacional',
            descricao: 'Caneca com versículos motivacionais para o dia a dia',
            preco: 24.90,
            categoria: 'Canecas',
            vendor_id: 'vendor1',
            vendor_nome: 'João Silva',
            vendor_nome_fantasia: 'Silva Produtos',
            origem: 'admin',
            created_by: 'lider1',
            created_by_role: 'lider',
            moderacao_status: 'pendente',
            data_criacao: '2024-01-23T09:15:00Z',
            data_submissao: '2024-01-23T11:30:00Z',
            requer_inscricao_aprovada: false,
            destaque: true
          },
          {
            id: '4',
            nome: 'Agenda Cristã 2024',
            descricao: 'Agenda anual com versículos diários e espaço para anotações',
            preco: 45.00,
            categoria: 'Livros',
            vendor_id: 'vendor2',
            vendor_nome: 'Maria Santos',
            origem: 'vendor',
            created_by: 'vendor2',
            created_by_role: 'fornecedor',
            moderacao_status: 'rejeitado',
            data_criacao: '2024-01-20T14:20:00Z',
            data_submissao: '2024-01-20T15:45:00Z',
            motivo_rejeicao: 'Imagens de baixa qualidade. Favor reenviar com fotos melhores.',
            requer_inscricao_aprovada: false,
            destaque: false
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setLoading(false)
    }
  }

  const handleApproval = async (produtoId: string, action: 'aprovar' | 'rejeitar' | 'revisar') => {
    try {
      const produto = produtos.find(p => p.id === produtoId)
      if (!produto) return

      // Verificar permissões baseadas no role
      if (userRole === 'lider' && produto.created_by_role === 'lider') {
        alert('Líderes não podem aprovar produtos criados por outros líderes')
        return
      }

      if (userRole === 'fornecedor') {
        alert('Fornecedores não têm permissão para aprovar produtos')
        return
      }

      const aprovacaoData = {
        produto_id: produtoId,
        action,
        aprovado_por: 'current_user_id', // ID do usuário atual
        aprovado_por_role: userRole,
        motivo_rejeicao: action === 'rejeitar' ? motivoRejeicao : undefined,
        observacoes_internas: observacoes || undefined,
        data_aprovacao: new Date().toISOString()
      }

      console.log('Processando aprovação:', aprovacaoData)

      // Simular processamento
      setTimeout(() => {
        setProdutos(prev => prev.map(p => 
          p.id === produtoId 
            ? { 
                ...p, 
                moderacao_status: action === 'aprovar' ? 'aprovado' : action === 'rejeitar' ? 'rejeitado' : 'revisao',
                motivo_rejeicao: action === 'rejeitar' ? motivoRejeicao : undefined,
                observacoes_internas: observacoes || undefined
              }
            : p
        ))
        
        setShowModal(null)
        setMotivoRejeicao('')
        setObservacoes('')
      }, 500)

    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    }
  }

  const getStatusColor = (status: ProdutoStatus) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      case 'revisao':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ProdutoStatus) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado'
      case 'pendente':
        return 'Pendente'
      case 'rejeitado':
        return 'Rejeitado'
      case 'revisao':
        return 'Em Revisão'
      default:
        return status
    }
  }

  const getStatusIcon = (status: ProdutoStatus) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-4 w-4" />
      case 'pendente':
        return <Clock className="h-4 w-4" />
      case 'rejeitado':
        return <X className="h-4 w-4" />
      case 'revisao':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const canApprove = (produto: ProdutoPendente) => {
    if (userRole === 'fornecedor') return false
    if (userRole === 'coordenador') return true
    if (userRole === 'lider') {
      // Líderes só podem aprovar produtos de fornecedores ou seus próprios
      return produto.created_by_role === 'fornecedor' || produto.created_by_role === 'lider'
    }
    return false
  }

  const getApprovalPermissions = () => {
    switch (userRole) {
      case 'coordenador':
        return 'Pode aprovar todos os produtos'
      case 'lider':
        return 'Pode aprovar produtos de fornecedores e outros líderes'
      case 'fornecedor':
        return 'Não pode aprovar produtos (apenas visualizar)'
      default:
        return ''
    }
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = 
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.vendor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.vendor_nome_fantasia && produto.vendor_nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'todos' || produto.moderacao_status === statusFilter
    const matchesOrigem = origemFilter === 'todos' || produto.origem === origemFilter
    
    return matchesSearch && matchesStatus && matchesOrigem
  })

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
          <h1 className="text-2xl font-bold text-gray-900">Aprovação de Produtos</h1>
          <p className="text-gray-600 mt-1">
            Revise e aprove produtos como <span className="font-medium">{userRole}</span>
          </p>
        </div>
      </div>

      {/* Permissões */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Permissões de Aprovação</h3>
            <p className="text-sm text-blue-700 mt-1">{getApprovalPermissions()}</p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {produtos.filter(p => p.moderacao_status === 'pendente').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">
                {produtos.filter(p => p.moderacao_status === 'aprovado').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-red-600">
                {produtos.filter(p => p.moderacao_status === 'rejeitado').length}
              </p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Revisão</p>
              <p className="text-2xl font-bold text-blue-600">
                {produtos.filter(p => p.moderacao_status === 'revisao').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos ou fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProdutoStatus | 'todos')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="revisao">Em Revisão</option>
            </select>
            
            <select
              value={origemFilter}
              onChange={(e) => setOrigemFilter(e.target.value as 'admin' | 'vendor' | 'todos')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todas as origens</option>
              <option value="admin">Admin/Líderes</option>
              <option value="vendor">Fornecedores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredProdutos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros de busca.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
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
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {produto.imagem ? (
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={produto.imagem} 
                              alt={produto.nome} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                          <div className="text-sm text-gray-500">{produto.categoria}</div>
                          {produto.destaque && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Building className="h-3 w-3 text-gray-400" />
                        {produto.vendor_nome_fantasia || produto.vendor_nome}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        Criado por {produto.created_by_role}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        produto.origem === 'vendor' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {produto.origem === 'vendor' ? 'Fornecedor' : 'Admin/Líder'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(produto.moderacao_status)}`}>
                        {getStatusIcon(produto.moderacao_status)}
                        {getStatusText(produto.moderacao_status)}
                      </span>
                      {produto.motivo_rejeicao && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          {produto.motivo_rejeicao}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(produto.preco)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(produto.data_submissao).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {canApprove(produto) && produto.moderacao_status === 'pendente' && (
                          <>
                            <button 
                              onClick={() => {
                                setShowModal(produto.id)
                                setModalAction('aprovar')
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setShowModal(produto.id)
                                setModalAction('rejeitar')
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setShowModal(produto.id)
                                setModalAction('revisar')
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </>
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

      {/* Modal de aprovação/rejeição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalAction === 'aprovar' ? 'Aprovar' : modalAction === 'rejeitar' ? 'Rejeitar' : 'Enviar para Revisão'} Produto
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {modalAction === 'aprovar' 
                  ? 'Tem certeza que deseja aprovar este produto? Ele ficará visível na loja.'
                  : modalAction === 'rejeitar'
                  ? 'Informe o motivo da rejeição para que possa ser corrigido:'
                  : 'Adicione observações para revisão do produto:'
                }
              </p>

              {(modalAction === 'rejeitar' || modalAction === 'revisar') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {modalAction === 'rejeitar' ? 'Motivo da rejeição' : 'Observações para revisão'}
                  </label>
                  <textarea
                    value={modalAction === 'rejeitar' ? motivoRejeicao : observacoes}
                    onChange={(e) => modalAction === 'rejeitar' 
                      ? setMotivoRejeicao(e.target.value)
                      : setObservacoes(e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={modalAction === 'rejeitar' 
                      ? "Descreva o motivo da rejeição..."
                      : "Adicione observações para revisão..."
                    }
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleApproval(showModal, modalAction)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    modalAction === 'aprovar'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : modalAction === 'rejeitar'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {modalAction === 'aprovar' ? 'Aprovar' : modalAction === 'rejeitar' ? 'Rejeitar' : 'Enviar para Revisão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}