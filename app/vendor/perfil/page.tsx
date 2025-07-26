'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText,
  Camera,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  Globe,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react'

type VendorProfile = {
  id: string
  nome: string
  nome_fantasia?: string
  documento: string
  tipo_documento: 'cpf' | 'cnpj'
  email: string
  telefone: string
  endereco: {
    cep: string
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  status: 'ativo' | 'suspenso' | 'pendente_aprovacao' | 'rejeitado'
  logo_url?: string
  descricao?: string
  website?: string
  redes_sociais?: {
    instagram?: string
    facebook?: string
    whatsapp?: string
  }
  conta_bancaria: {
    banco: string
    agencia: string
    conta: string
    tipo_conta: 'corrente' | 'poupanca'
    titular: string
    documento_titular: string
  }
  data_aprovacao?: string
  created: string
}

export default function VendorPerfil() {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('dados-pessoais')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      // Simular dados por enquanto
      setTimeout(() => {
        setProfile({
          id: '1',
          nome: 'João Silva',
          nome_fantasia: 'Silva Produtos Personalizados',
          documento: '123.456.789-00',
          tipo_documento: 'cpf',
          email: 'joao@silva.com',
          telefone: '(11) 99999-9999',
          endereco: {
            cep: '01234-567',
            rua: 'Rua das Flores',
            numero: '123',
            complemento: 'Sala 101',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP'
          },
          status: 'ativo',
          logo_url: '/logos/silva-produtos.jpg',
          descricao: 'Especialista em produtos personalizados para ministério jovem. Mais de 5 anos de experiência no mercado.',
          website: 'https://silvaproducts.com.br',
          redes_sociais: {
            instagram: '@silvaproducts',
            facebook: 'SilvaProducts',
            whatsapp: '5511999999999'
          },
          conta_bancaria: {
            banco: 'Banco do Brasil',
            agencia: '1234-5',
            conta: '67890-1',
            tipo_conta: 'corrente',
            titular: 'João Silva',
            documento_titular: '123.456.789-00'
          },
          data_aprovacao: '2024-01-10',
          created: '2024-01-01'
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Simular salvamento
      setTimeout(() => {
        setSaving(false)
        setEditing(false)
        // Mostrar toast de sucesso
      }, 1000)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'pendente_aprovacao':
        return 'Pendente Aprovação'
      case 'suspenso':
        return 'Suspenso'
      case 'rejeitado':
        return 'Rejeitado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />
      case 'pendente_aprovacao':
        return <AlertCircle className="h-4 w-4" />
      case 'suspenso':
        return <AlertCircle className="h-4 w-4" />
      case 'rejeitado':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Erro ao carregar perfil do fornecedor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações de fornecedor</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
            {getStatusIcon(profile.status)}
            {getStatusText(profile.status)}
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dados-pessoais', label: 'Dados Pessoais', icon: User },
            { id: 'endereco', label: 'Endereço', icon: MapPin },
            { id: 'empresa', label: 'Dados da Empresa', icon: Building },
            { id: 'bancarios', label: 'Dados Bancários', icon: FileText },
            { id: 'redes-sociais', label: 'Redes Sociais', icon: Globe }
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
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {activeTab === 'dados-pessoais' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              {editing && (
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Camera className="h-4 w-4" />
                  Alterar Logo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profile.nome}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={profile.nome_fantasia || ''}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento ({profile.tipo_documento.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={profile.documento}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={profile.telefone}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={profile.descricao || ''}
                disabled={!editing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Conte um pouco sobre você e seus produtos..."
              />
            </div>
          </div>
        )}

        {activeTab === 'endereco' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={profile.endereco.cep}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua
                </label>
                <input
                  type="text"
                  value={profile.endereco.rua}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={profile.endereco.numero}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={profile.endereco.complemento || ''}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  value={profile.endereco.bairro}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={profile.endereco.cidade}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={profile.endereco.estado}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  {/* Adicionar outros estados */}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'redes-sociais' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Redes Sociais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </div>
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  disabled={!editing}
                  placeholder="https://seu-site.com.br"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </div>
                </label>
                <input
                  type="text"
                  value={profile.redes_sociais?.instagram || ''}
                  disabled={!editing}
                  placeholder="@seu_usuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </div>
                </label>
                <input
                  type="text"
                  value={profile.redes_sociais?.facebook || ''}
                  disabled={!editing}
                  placeholder="SeuPerfil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </div>
                </label>
                <input
                  type="text"
                  value={profile.redes_sociais?.whatsapp || ''}
                  disabled={!editing}
                  placeholder="5511999999999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Outras abas similares para empresa e dados bancários */}
      </div>

      {/* Informações adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Perfil Aprovado</h3>
            <p className="text-sm text-blue-700 mt-1">
              Seu perfil foi aprovado em {new Date(profile.data_aprovacao!).toLocaleDateString('pt-BR')}. 
              Você pode começar a cadastrar produtos e receber pedidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}