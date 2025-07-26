'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import Link from 'next/link'

type ProdutoStatus = 'aprovado' | 'pendente' | 'rejeitado'

type ProdutoFornecedor = {
  id: string
  nome: string
  preco: number
  imagem?: string
  categoria: string
  status: ProdutoStatus
  estoque: number
  vendas: number
  created: string
  motivo_rejeicao?: string
}

export default function VendorProdutos() {
  const [produtos, setProdutos] = useState<ProdutoFornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProdutoStatus | 'todos'>('todos')
  const [showMotivoRejeicao, setShowMotivoRejeicao] = useState<string | null>(null)

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      // Simular dados por enquanto
      setTimeout(() => {
        setProdutos([
          {
            id: '1',
            nome: 'Kit Jovem Premium',
            preco: 65.00,
            categoria: 'Kits',
            status: 'aprovado',
            estoque: 25,
            vendas: 45,
            created: '2024-01-15',
            imagem: '/produtos/kit-jovem.jpg'
          },
          {
            id: '2',
            nome: 'Camiseta Básica M24',
            preco: 35.00,
            categoria: 'Camisetas',
            status: 'pendente',
            estoque: 50,
            vendas: 0,
            created: '2024-01-20'
          },
          {
            id: '3',
            nome: 'Boné Personalizado',
            preco: 28.00,
            categoria: 'Acessórios',
            status: 'rejeitado',
            estoque: 0,
            vendas: 0,
            created: '2024-01-18',
            motivo_rejeicao: 'Imagem de baixa qualidade. Favor enviar fotos com melhor resolução.'
          },
          {
            id: '4',
            nome: 'Kit Infantil',
            preco: 45.00,
            categoria: 'Kits',
            status: 'aprovado',
            estoque: 30,
            vendas: 23,
            created: '2024-01-10'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setLoading(false)
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
      default:
        return 'bg-gray-100 text-gray-800'
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
      default:
        return null
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
      default:
        return status
    }
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || produto.status === statusFilter
    return matchesSearch && matchesStatus
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
          <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus produtos e monitore aprovações</p>
        </div>
        <Link
          href="/vendor/produtos/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
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
              <option value="aprovado">Aprovado</option>
              <option value="pendente">Pendente</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{produtos.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">
                {produtos.filter(p => p.status === 'aprovado').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {produtos.filter(p => p.status === 'pendente').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-red-600">
                {produtos.filter(p => p.status === 'rejeitado').length}
              </p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredProdutos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'todos' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece adicionando seu primeiro produto.'
              }
            </p>
            {!searchTerm && statusFilter === 'todos' && (
              <Link
                href="/vendor/produtos/novo"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Link>
            )}
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
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                          <div className="text-sm text-gray-500">
                            Criado em {new Date(produto.created).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(produto.preco)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(produto.status)}`}>
                          {getStatusIcon(produto.status)}
                          {getStatusText(produto.status)}
                        </span>
                        {produto.status === 'rejeitado' && produto.motivo_rejeicao && (
                          <button
                            onClick={() => setShowMotivoRejeicao(produto.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.estoque}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.vendas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal de motivo de rejeição */}
      {showMotivoRejeicao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Motivo da Rejeição</h3>
              <button
                onClick={() => setShowMotivoRejeicao(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {produtos.find(p => p.id === showMotivoRejeicao)?.motivo_rejeicao}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowMotivoRejeicao(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}