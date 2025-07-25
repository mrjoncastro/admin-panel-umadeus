'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Palette,
  Type,
  Layout,
  Image,
  Eye,
  Save,
  Send,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import type { IdentidadeVisualRegional, TemplateRegional } from '../../../../../types/regional-branding'

export default function IdentidadeVisualEditor() {
  const params = useParams()
  const regiaoId = params.id as string

  const [identidade, setIdentidade] = useState<IdentidadeVisualRegional | null>(null)
  const [templates, setTemplates] = useState<TemplateRegional[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'cores' | 'logos' | 'tipografia' | 'layout'>('cores')

  useEffect(() => {
    carregarDados()
  }, [regiaoId])

  async function carregarDados() {
    setLoading(true)
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        setIdentidade(getMockIdentidade())
        setTemplates(getMockTemplates())
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoading(false)
    }
  }

  async function salvarIdentidade() {
    setSaving(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Identidade salva:', identidade)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  async function solicitarAprovacao() {
    if (!identidade) return
    
    try {
      // Simular solicitação de aprovação
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIdentidade({
        ...identidade,
        status: 'aprovacao_pendente'
      })
      console.log('Aprovação solicitada')
    } catch (error) {
      console.error('Erro ao solicitar aprovação:', error)
    }
  }

  function aplicarTemplate(template: TemplateRegional) {
    if (!identidade) return

    setIdentidade({
      ...identidade,
      cores: template.cores_padrao,
      layout: template.layout_padrao,
      tipografia: template.tipografia_padrao,
      versao: identidade.versao + 1
    })
  }

  function updateCores(novasCores: Partial<IdentidadeVisualRegional['cores']>) {
    if (!identidade) return
    
    setIdentidade({
      ...identidade,
      cores: { ...identidade.cores, ...novasCores }
    })
  }

  function updateLayout(novoLayout: Partial<IdentidadeVisualRegional['layout']>) {
    if (!identidade) return
    
    setIdentidade({
      ...identidade,
      layout: { ...identidade.layout, ...novoLayout }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!identidade) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Identidade Visual não encontrada
        </h3>
        <p className="text-gray-600">
          Crie uma nova identidade visual para esta região.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de Identidade Visual</h1>
          <p className="text-gray-600">Customize a identidade visual da sua região</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Sair do Preview' : 'Preview'}
          </button>
          
          <button
            onClick={salvarIdentidade}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          
          <button
            onClick={solicitarAprovacao}
            disabled={identidade.status === 'aprovacao_pendente'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {identidade.status === 'aprovacao_pendente' ? 'Aguardando Aprovação' : 'Solicitar Aprovação'}
          </button>
        </div>
      </div>

      {/* Status da Identidade */}
      <div className={`p-4 rounded-lg border-l-4 ${
        identidade.status === 'ativo' ? 'bg-green-50 border-green-400' :
        identidade.status === 'aprovacao_pendente' ? 'bg-yellow-50 border-yellow-400' :
        identidade.status === 'rejeitado' ? 'bg-red-50 border-red-400' :
        'bg-blue-50 border-blue-400'
      }`}>
        <div className="flex items-center">
          {identidade.status === 'ativo' && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
          {identidade.status === 'aprovacao_pendente' && <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />}
          {identidade.status === 'rejeitado' && <AlertCircle className="h-5 w-5 text-red-600 mr-2" />}
          {identidade.status === 'rascunho' && <Info className="h-5 w-5 text-blue-600 mr-2" />}
          
          <span className={`font-medium ${
            identidade.status === 'ativo' ? 'text-green-800' :
            identidade.status === 'aprovacao_pendente' ? 'text-yellow-800' :
            identidade.status === 'rejeitado' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {identidade.status === 'ativo' && 'Identidade Visual Ativa'}
            {identidade.status === 'aprovacao_pendente' && 'Aguardando Aprovação'}
            {identidade.status === 'rejeitado' && 'Rejeitado - Necessário Revisar'}
            {identidade.status === 'rascunho' && 'Rascunho - Em Edição'}
          </span>
        </div>
        
        {identidade.observacoes_aprovacao && (
          <p className="mt-2 text-sm text-gray-700">
            {identidade.observacoes_aprovacao}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Templates Pré-definidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="relative group cursor-pointer">
                  <div 
                    className="aspect-video bg-gradient-to-br rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors p-4"
                    style={{
                      background: `linear-gradient(135deg, ${template.cores_padrao.primaria}, ${template.cores_padrao.secundaria})`
                    }}
                    onClick={() => aplicarTemplate(template)}
                  >
                    <div className="text-white text-xs font-medium">{template.nome}</div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all"></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{template.categoria}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs de Edição */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'cores', label: 'Cores', icon: Palette },
                  { id: 'logos', label: 'Logos', icon: Image },
                  { id: 'tipografia', label: 'Tipografia', icon: Type },
                  { id: 'layout', label: 'Layout', icon: Layout }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Tab: Cores */}
              {activeTab === 'cores' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium mb-4">Paleta de Cores</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Primária
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={identidade.cores.primaria}
                            onChange={(e) => updateCores({ primaria: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={identidade.cores.primaria}
                            onChange={(e) => updateCores({ primaria: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor Secundária
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={identidade.cores.secundaria}
                            onChange={(e) => updateCores({ secundaria: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={identidade.cores.secundaria}
                            onChange={(e) => updateCores({ secundaria: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor de Acento
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={identidade.cores.acento}
                            onChange={(e) => updateCores({ acento: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={identidade.cores.acento}
                            onChange={(e) => updateCores({ acento: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor do Texto Principal
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={identidade.cores.texto_primario}
                            onChange={(e) => updateCores({ texto_primario: e.target.value })}
                            className="w-12 h-10 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={identidade.cores.texto_primario}
                            onChange={(e) => updateCores({ texto_primario: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paleta de Cores Aprovadas */}
                  <div>
                    <h4 className="text-md font-medium mb-4">Cores Pré-aprovadas</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {identidade.restricoes.paleta_cores_aprovadas.map((cor, index) => (
                        <button
                          key={index}
                          onClick={() => updateCores({ primaria: cor })}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                          style={{ backgroundColor: cor }}
                          title={cor}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Layout */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo da Navbar
                      </label>
                      <select
                        value={identidade.layout.estilo_navbar}
                        onChange={(e) => updateLayout({ 
                          estilo_navbar: e.target.value as 'minimal' | 'completo' | 'compacto' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="minimal">Minimal</option>
                        <option value="completo">Completo</option>
                        <option value="compacto">Compacto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posição do Logo
                      </label>
                      <select
                        value={identidade.layout.posicao_logo}
                        onChange={(e) => updateLayout({ 
                          posicao_logo: e.target.value as 'esquerda' | 'centro' | 'direita' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="esquerda">Esquerda</option>
                        <option value="centro">Centro</option>
                        <option value="direita">Direita</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo dos Botões
                      </label>
                      <select
                        value={identidade.layout.estilo_botoes}
                        onChange={(e) => updateLayout({ 
                          estilo_botoes: e.target.value as 'rounded' | 'square' | 'pill' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="rounded">Arredondado</option>
                        <option value="square">Quadrado</option>
                        <option value="pill">Pílula</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Espacamento
                      </label>
                      <select
                        value={identidade.layout.espacamento}
                        onChange={(e) => updateLayout({ 
                          espacamento: e.target.value as 'compacto' | 'normal' | 'amplo' 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="compacto">Compacto</option>
                        <option value="normal">Normal</option>
                        <option value="amplo">Amplo</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Outros tabs... */}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Preview em Tempo Real</h3>
            
            {/* Preview Card */}
            <div 
              className="border rounded-lg overflow-hidden"
              style={{
                '--cor-primaria': identidade.cores.primaria,
                '--cor-secundaria': identidade.cores.secundaria,
                '--cor-acento': identidade.cores.acento
              } as React.CSSProperties}
            >
              {/* Header Preview */}
              <div 
                className={`p-4 text-white ${
                  identidade.layout.estilo_navbar === 'minimal' ? 'py-2' :
                  identidade.layout.estilo_navbar === 'compacto' ? 'py-1' : 'py-4'
                }`}
                style={{ backgroundColor: identidade.cores.primaria }}
              >
                <div className={`flex items-center ${
                  identidade.layout.posicao_logo === 'centro' ? 'justify-center' :
                  identidade.layout.posicao_logo === 'direita' ? 'justify-end' :
                  'justify-start'
                }`}>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
                  <span className="ml-2 font-medium">Logo</span>
                </div>
              </div>
              
              {/* Content Preview */}
              <div className="p-4 space-y-3">
                <h4 className="font-semibold" style={{ color: identidade.cores.texto_primario }}>
                  Título da Página
                </h4>
                <p className="text-sm" style={{ color: identidade.cores.texto_secundario }}>
                  Este é um exemplo de como o texto aparecerá com as cores selecionadas.
                </p>
                
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 text-white text-sm ${
                      identidade.layout.estilo_botoes === 'rounded' ? 'rounded-md' :
                      identidade.layout.estilo_botoes === 'pill' ? 'rounded-full' : ''
                    }`}
                    style={{ backgroundColor: identidade.cores.primaria }}
                  >
                    Botão Primário
                  </button>
                  <button
                    className={`px-3 py-1 text-white text-sm ${
                      identidade.layout.estilo_botoes === 'rounded' ? 'rounded-md' :
                      identidade.layout.estilo_botoes === 'pill' ? 'rounded-full' : ''
                    }`}
                    style={{ backgroundColor: identidade.cores.secundaria }}
                  >
                    Secundário
                  </button>
                </div>
                
                <div 
                  className={`p-3 ${
                    identidade.layout.estilo_cards === 'shadow' ? 'shadow-md' :
                    identidade.layout.estilo_cards === 'bordered' ? 'border' : ''
                  } ${
                    identidade.layout.estilo_botoes === 'rounded' ? 'rounded-md' :
                    identidade.layout.estilo_botoes === 'pill' ? 'rounded-lg' : ''
                  }`}
                  style={{ backgroundColor: identidade.cores.fundo_secundario }}
                >
                  <div className="text-sm">Card de exemplo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Check */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Verificação de Compliance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cores aprovadas</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Proporções do logo</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Elementos obrigatórios</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Acessibilidade</span>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Score de Qualidade</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data functions
function getMockIdentidade(): IdentidadeVisualRegional {
  return {
    id: '1',
    regiao_id: '1',
    nome_fantasia: 'São Paulo Vendas',
    cores: {
      primaria: '#1E40AF',
      secundaria: '#3B82F6',
      acento: '#10B981',
      texto_primario: '#1F2937',
      texto_secundario: '#6B7280',
      fundo_principal: '#FFFFFF',
      fundo_secundario: '#F9FAFB'
    },
    logos: {
      principal: '/logos/sp-principal.svg',
      horizontal: '/logos/sp-horizontal.svg',
      simbolo: '/logos/sp-simbolo.svg',
      monocromatico: '/logos/sp-mono.svg',
      favicon: '/logos/sp-favicon.ico'
    },
    tipografia: {
      fonte_primaria: {
        nome: 'Inter',
        familia: 'Inter, sans-serif',
        variantes: ['normal', 'bold'],
        google_font: true
      },
      fonte_secundaria: {
        nome: 'Inter',
        familia: 'Inter, sans-serif',
        variantes: ['normal', 'bold'],
        google_font: true
      },
      tamanhos: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
        body: '1rem',
        small: '0.875rem',
        caption: '0.75rem'
      }
    },
    elementos: {
      banner_hero: '/banners/sp-hero.jpg',
      imagens_destaque: ['/images/sp-1.jpg', '/images/sp-2.jpg'],
      icones_customizados: {},
      padroes_fundo: []
    },
    layout: {
      estilo_navbar: 'completo',
      posicao_logo: 'esquerda',
      estilo_botoes: 'rounded',
      estilo_cards: 'shadow',
      espacamento: 'normal'
    },
    status: 'rascunho',
    versao: 1,
    restricoes: {
      paleta_cores_aprovadas: [
        '#1E40AF', '#3B82F6', '#60A5FA',
        '#059669', '#10B981', '#34D399',
        '#DC2626', '#EF4444', '#F87171',
        '#7C2D12', '#EA580C', '#FB923C',
        '#7C3AED', '#8B5CF6', '#A78BFA',
        '#374151', '#6B7280', '#9CA3AF'
      ],
      fontes_permitidas: [
        {
          nome: 'Inter',
          familia: 'Inter, sans-serif',
          variantes: ['normal', 'bold'],
          google_font: true
        }
      ],
      elementos_obrigatorios: ['logo_corporativo'],
      proporcoes_logo: {
        altura_minima: 32,
        altura_maxima: 96,
        largura_minima: 32,
        largura_maxima: 128,
        margem_seguranca: 16
      }
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
}

function getMockTemplates(): TemplateRegional[] {
  return [
    {
      id: '1',
      nome: 'Corporativo',
      descricao: 'Design limpo e profissional',
      categoria: 'corporativo',
      preview_image: '/templates/corporativo.jpg',
      cores_padrao: {
        primaria: '#1E40AF',
        secundaria: '#3B82F6',
        acento: '#10B981',
        texto_primario: '#1F2937',
        texto_secundario: '#6B7280',
        fundo_principal: '#FFFFFF',
        fundo_secundario: '#F9FAFB'
      },
      layout_padrao: {
        estilo_navbar: 'completo',
        posicao_logo: 'esquerda',
        estilo_botoes: 'rounded',
        estilo_cards: 'shadow',
        espacamento: 'normal'
      },
      tipografia_padrao: {
        fonte_primaria: {
          nome: 'Inter',
          familia: 'Inter, sans-serif',
          variantes: ['normal', 'bold'],
          google_font: true
        },
        fonte_secundaria: {
          nome: 'Inter',
          familia: 'Inter, sans-serif',
          variantes: ['normal', 'bold'],
          google_font: true
        },
        tamanhos: {
          h1: '2.5rem',
          h2: '2rem',
          h3: '1.5rem',
          h4: '1.25rem',
          body: '1rem',
          small: '0.875rem',
          caption: '0.75rem'
        }
      },
      elementos_inclusos: ['navbar', 'footer', 'cards'],
      usado_por_regioes: 12,
      avaliacao_media: 4.5,
      ativo: true,
      created: new Date().toISOString()
    },
    {
      id: '2',
      nome: 'Moderno',
      descricao: 'Design contemporâneo e vibrante',
      categoria: 'moderno',
      preview_image: '/templates/moderno.jpg',
      cores_padrao: {
        primaria: '#7C3AED',
        secundaria: '#8B5CF6',
        acento: '#F59E0B',
        texto_primario: '#1F2937',
        texto_secundario: '#6B7280',
        fundo_principal: '#FFFFFF',
        fundo_secundario: '#F3F4F6'
      },
      layout_padrao: {
        estilo_navbar: 'minimal',
        posicao_logo: 'centro',
        estilo_botoes: 'pill',
        estilo_cards: 'flat',
        espacamento: 'amplo'
      },
      tipografia_padrao: {
        fonte_primaria: {
          nome: 'Poppins',
          familia: 'Poppins, sans-serif',
          variantes: ['normal', 'bold'],
          google_font: true
        },
        fonte_secundaria: {
          nome: 'Inter',
          familia: 'Inter, sans-serif',
          variantes: ['normal', 'bold'],
          google_font: true
        },
        tamanhos: {
          h1: '3rem',
          h2: '2.25rem',
          h3: '1.75rem',
          h4: '1.25rem',
          body: '1rem',
          small: '0.875rem',
          caption: '0.75rem'
        }
      },
      elementos_inclusos: ['navbar', 'hero', 'cards', 'footer'],
      usado_por_regioes: 8,
      avaliacao_media: 4.2,
      ativo: true,
      created: new Date().toISOString()
    }
  ]
}