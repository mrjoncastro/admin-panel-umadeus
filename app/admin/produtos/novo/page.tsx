'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Upload, 
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Eye,
  Building,
  User,
  DollarSign,
  Palette,
  Ruler,
  Tags
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type UserRole = 'coordenador' | 'lider' | 'fornecedor'

type Fornecedor = {
  id: string
  nome: string
  nome_fantasia?: string
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao'
}

type ProductFormData = {
  nome: string
  descricao: string
  detalhes: string
  preco: number
  preco_bruto: number
  categoria: string
  tamanhos: string[]
  cores: string[]
  generos: string[]
  imagens: string[]
  slug: string
  ativo: boolean
  requer_inscricao_aprovada: boolean
  exclusivo_user: boolean
  vendor_id?: string
  origem: 'admin' | 'vendor'
  destaque: boolean
  peso?: number
  dimensoes?: {
    altura: number
    largura: number
    profundidade: number
  }
  estoque_disponivel: number
  estoque_minimo: number
}

export default function NovoProduto() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>('coordenador') // Simular role do usuário
  const [currentUserId, setCurrentUserId] = useState('user123')
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  const [formData, setFormData] = useState<ProductFormData>({
    nome: '',
    descricao: '',
    detalhes: '',
    preco: 0,
    preco_bruto: 0,
    categoria: '',
    tamanhos: [],
    cores: [],
    generos: [],
    imagens: [],
    slug: '',
    ativo: true,
    requer_inscricao_aprovada: false,
    exclusivo_user: false,
    vendor_id: undefined,
    origem: userRole === 'fornecedor' ? 'vendor' : 'admin',
    destaque: false,
    peso: 0,
    dimensoes: {
      altura: 0,
      largura: 0,
      profundidade: 0
    },
    estoque_disponivel: 0,
    estoque_minimo: 5
  })

  useEffect(() => {
    fetchFornecedores()
    
    // Se for fornecedor, definir automaticamente como vendor_id
    if (userRole === 'fornecedor') {
      setFormData(prev => ({
        ...prev,
        vendor_id: currentUserId,
        origem: 'vendor'
      }))
    }
  }, [userRole, currentUserId])

  const fetchFornecedores = async () => {
    // Simular busca de fornecedores ativos
    setTimeout(() => {
      setFornecedores([
        {
          id: '1',
          nome: 'João Silva',
          nome_fantasia: 'Silva Produtos',
          status: 'ativo'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          nome_fantasia: 'Maria Artes',
          status: 'ativo'
        }
      ])
    }, 500)
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-gerar slug a partir do nome
    if (field === 'nome') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const handleArrayChange = (field: 'tamanhos' | 'cores' | 'generos', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Simular upload de imagens
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        imagens: [...prev.imagens, ...newImages]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }))
  }

  const getApprovalRequirement = () => {
    switch (userRole) {
      case 'coordenador':
        return 'Produto será publicado imediatamente (sem necessidade de aprovação)'
      case 'lider':
        return 'Produto ficará pendente até aprovação do coordenador'
      case 'fornecedor':
        return 'Produto ficará pendente até aprovação da liderança'
      default:
        return ''
    }
  }

  const getVisibilityRules = () => {
    const rules = []
    
    if (userRole === 'fornecedor') {
      rules.push('• Apenas fornecedores podem criar produtos de origem "vendor"')
      rules.push('• Produtos ficam pendentes até aprovação')
    }
    
    if (userRole === 'lider') {
      rules.push('• Pode criar produtos para qualquer fornecedor do seu território')
      rules.push('• Produtos ficam pendentes até aprovação do coordenador')
    }
    
    if (userRole === 'coordenador') {
      rules.push('• Pode criar produtos para qualquer fornecedor')
      rules.push('• Produtos são publicados imediatamente')
      rules.push('• Pode definir produtos em destaque')
    }

    return rules
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações
      if (!formData.nome || !formData.preco || !formData.categoria) {
        alert('Preencha os campos obrigatórios')
        return
      }

      if (userRole !== 'coordenador' && !formData.vendor_id) {
        alert('Selecione um fornecedor')
        return
      }

      // Determinar status inicial baseado no role
      let statusInicial = 'pendente'
      if (userRole === 'coordenador') {
        statusInicial = 'aprovado'
      }

      const produtoData = {
        ...formData,
        moderacao_status: statusInicial,
        aprovado: userRole === 'coordenador',
        created_by: currentUserId,
        created_by_role: userRole
      }

      console.log('Criando produto:', produtoData)

      // Simular criação
      setTimeout(() => {
        setLoading(false)
        router.push('/admin/produtos?status=created')
      }, 2000)

    } catch (error) {
      console.error('Erro ao criar produto:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/produtos"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
            <p className="text-gray-600 mt-1">
              Cadastrar produto como <span className="font-medium">{userRole}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Editar' : 'Visualizar'}
          </button>
        </div>
      </div>

      {/* Regras de autorização */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Regras de Autorização</h3>
            <p className="text-sm text-blue-700 mt-1">
              {getApprovalRequirement()}
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              {getVisibilityRules().map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Kit Jovem Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                <option value="kits">Kits</option>
                <option value="camisetas">Camisetas</option>
                <option value="acessorios">Acessórios</option>
                <option value="canecas">Canecas</option>
                <option value="livros">Livros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="produto-exemplo"
              />
            </div>

            {/* Seletor de fornecedor - apenas para coordenadores e líderes */}
            {userRole !== 'fornecedor' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor *
                </label>
                <select
                  required
                  value={formData.vendor_id || ''}
                  onChange={(e) => handleInputChange('vendor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome_fantasia || fornecedor.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                required
                rows={3}
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição resumida do produto"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalhes do Produto
              </label>
              <textarea
                rows={5}
                value={formData.detalhes}
                onChange={(e) => handleInputChange('detalhes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informações detalhadas, especificações, material, etc."
              />
            </div>
          </div>
        </div>

        {/* Preços e estoque */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços e Estoque
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.preco}
                onChange={(e) => handleInputChange('preco', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço de Custo (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.preco_bruto}
                onChange={(e) => handleInputChange('preco_bruto', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Disponível
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque_disponivel}
                onChange={(e) => handleInputChange('estoque_disponivel', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque_minimo}
                onChange={(e) => handleInputChange('estoque_minimo', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Variações */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Variações do Produto
          </h3>
          
          <div className="space-y-6">
            {/* Tamanhos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanhos Disponíveis
              </label>
              <div className="flex flex-wrap gap-2">
                {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].map(tamanho => (
                  <button
                    key={tamanho}
                    type="button"
                    onClick={() => handleArrayChange('tamanhos', tamanho)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                      formData.tamanhos.includes(tamanho)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cores Disponíveis
              </label>
              <div className="flex flex-wrap gap-2">
                {['Branco', 'Preto', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Rosa', 'Cinza'].map(cor => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => handleArrayChange('cores', cor)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                      formData.cores.includes(cor)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            {/* Gêneros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gêneros
              </label>
              <div className="flex flex-wrap gap-2">
                {['Masculino', 'Feminino', 'Unissex', 'Infantil'].map(genero => (
                  <button
                    key={genero}
                    type="button"
                    onClick={() => handleArrayChange('generos', genero)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                      formData.generos.includes(genero)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {genero}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Imagens */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Imagens do Produto
          </h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Adicionar imagens
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG até 10MB cada
                  </p>
                </div>
              </div>
            </div>

            {formData.imagens.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.imagens.map((imagem, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imagem}
                      alt={`Produto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configurações
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => handleInputChange('ativo', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                Produto ativo (visível na loja após aprovação)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requer_inscricao"
                checked={formData.requer_inscricao_aprovada}
                onChange={(e) => handleInputChange('requer_inscricao_aprovada', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="requer_inscricao" className="ml-2 text-sm text-gray-700">
                Requer inscrição aprovada para compra
              </label>
            </div>

            {userRole === 'coordenador' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="destaque"
                  checked={formData.destaque}
                  onChange={(e) => handleInputChange('destaque', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label htmlFor="destaque" className="ml-2 text-sm text-gray-700">
                  Produto em destaque (apenas coordenadores)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/produtos"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Criando...' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}