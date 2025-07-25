import { useEffect, useState } from 'react'
import type { TemaDinamico } from '../types/regional-branding'

export function useRegionalTheme(regiaoId?: string) {
  const [tema, setTema] = useState<TemaDinamico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!regiaoId) {
      // Aplicar tema padrão se não houver região
      aplicarTemaDefault()
      setLoading(false)
      return
    }

    carregarTemaRegional(regiaoId)
  }, [regiaoId])

  async function carregarTemaRegional(regiaoId: string) {
    setLoading(true)
    setError(null)

    try {
      // Buscar tema da região (mockado por enquanto)
      const temaMock = getMockTema(regiaoId)
      
      // Aplicar CSS customizado
      await aplicarCSS(temaMock.css_customizado, temaMock.cache_key)
      
      // Aplicar variáveis CSS
      aplicarVariaveisCSS(temaMock.css_variables)
      
      // Carregar fontes se necessário
      await carregarFontes(temaMock.assets_otimizados.fontes_woff2)
      
      setTema(temaMock)
    } catch (err) {
      console.error('Erro ao carregar tema regional:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      aplicarTemaDefault()
    } finally {
      setLoading(false)
    }
  }

  async function aplicarCSS(css: string, cacheKey: string) {
    // Verificar se já existe um style com este cache key
    const existingStyle = document.getElementById(`tema-regional-${cacheKey}`)
    if (existingStyle) {
      return // CSS já aplicado
    }

    // Remover CSS anterior de tema regional
    const oldStyles = document.querySelectorAll('[id^="tema-regional-"]')
    oldStyles.forEach(style => style.remove())

    // Criar novo elemento style
    const styleElement = document.createElement('style')
    styleElement.id = `tema-regional-${cacheKey}`
    styleElement.textContent = css
    document.head.appendChild(styleElement)
  }

  function aplicarVariaveisCSS(variables: Record<string, string>) {
    const root = document.documentElement
    
    // Aplicar cada variável CSS
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  async function carregarFontes(fontes: Record<string, string>) {
    const fontsPromises = Object.entries(fontes).map(async ([nome, url]) => {
      // Verificar se a fonte já está carregada
      if (document.querySelector(`link[href="${url}"]`)) {
        return
      }

      // Se for Google Font, carregar via link
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        const link = document.createElement('link')
        link.href = url
        link.rel = 'stylesheet'
        link.type = 'text/css'
        document.head.appendChild(link)
        return
      }

      // Para fontes locais, usar Font Loading API
      if ('fonts' in document) {
        try {
          const fontFace = new FontFace(nome, `url(${url})`)
          await fontFace.load()
          document.fonts.add(fontFace)
        } catch (error) {
          console.warn(`Erro ao carregar fonte ${nome}:`, error)
        }
      }
    })

    await Promise.allSettled(fontsPromises)
  }

  function aplicarTemaDefault() {
    // Remover qualquer CSS de tema regional
    const oldStyles = document.querySelectorAll('[id^="tema-regional-"]')
    oldStyles.forEach(style => style.remove())

    // Aplicar variáveis padrão
    const root = document.documentElement
    const variaveisDefault = {
      '--cor-primaria': '#3B82F6',
      '--cor-secundaria': '#1E40AF',
      '--cor-acento': '#10B981',
      '--cor-texto-primario': '#1F2937',
      '--cor-texto-secundario': '#6B7280',
      '--cor-fundo-principal': '#FFFFFF',
      '--cor-fundo-secundario': '#F9FAFB',
      '--fonte-primaria': 'Inter, sans-serif',
      '--fonte-secundaria': 'Inter, sans-serif',
      '--espacamento-base': '1rem',
      '--border-radius-base': '0.5rem'
    }

    Object.entries(variaveisDefault).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    setTema(null)
  }

  function resetTema() {
    aplicarTemaDefault()
  }

  function atualizarTema(novoTema: Partial<TemaDinamico>) {
    if (!tema) return

    const temaAtualizado = { ...tema, ...novoTema }
    
    if (novoTema.css_customizado) {
      aplicarCSS(temaAtualizado.css_customizado, temaAtualizado.cache_key)
    }
    
    if (novoTema.css_variables) {
      aplicarVariaveisCSS(temaAtualizado.css_variables)
    }

    setTema(temaAtualizado)
  }

  return {
    tema,
    loading,
    error,
    resetTema,
    atualizarTema,
    recarregarTema: () => regiaoId && carregarTemaRegional(regiaoId)
  }
}

// Hook para detectar região automaticamente
export function useAutoRegionalTheme() {
  const [regiaoId, setRegiaoId] = useState<string | undefined>()

  useEffect(() => {
    // Detectar região baseado em geolocalização, URL, ou configuração do usuário
    detectarRegiao()
  }, [])

  async function detectarRegiao() {
    try {
      // 1. Tentar detectar por parâmetro na URL
      const urlParams = new URLSearchParams(window.location.search)
      const regiaoParam = urlParams.get('regiao')
      if (regiaoParam) {
        setRegiaoId(regiaoParam)
        return
      }

      // 2. Tentar detectar por localStorage
      const regiaoSalva = localStorage.getItem('regiao_selecionada')
      if (regiaoSalva) {
        setRegiaoId(regiaoSalva)
        return
      }

      // 3. Tentar detectar por geolocalização (simplificado)
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const regiao = detectarRegiaoPorCoordenadas(latitude, longitude)
            if (regiao) {
              setRegiaoId(regiao)
              localStorage.setItem('regiao_selecionada', regiao)
            }
          },
          (error) => {
            console.warn('Erro ao obter geolocalização:', error)
            // Usar região padrão ou mostrar seletor
          }
        )
      }
    } catch (error) {
      console.error('Erro ao detectar região:', error)
    }
  }

  function detectarRegiaoPorCoordenadas(lat: number, lon: number): string | null {
    // Implementação simplificada - em produção usaria um serviço de geocoding
    
    // São Paulo (exemplo)
    if (lat >= -24.0 && lat <= -23.0 && lon >= -47.0 && lon <= -46.0) {
      return 'sao-paulo-capital'
    }
    
    // Rio de Janeiro (exemplo)
    if (lat >= -23.1 && lat <= -22.7 && lon >= -43.8 && lon <= -43.1) {
      return 'rio-de-janeiro'
    }
    
    // Adicionar mais regiões conforme necessário
    
    return null
  }

  const theme = useRegionalTheme(regiaoId)

  return {
    ...theme,
    regiaoId,
    setRegiaoId: (novaRegiao: string) => {
      setRegiaoId(novaRegiao)
      localStorage.setItem('regiao_selecionada', novaRegiao)
    }
  }
}

// Hook para preview de temas
export function useThemePreview() {
  const [previewTema, setPreviewTema] = useState<TemaDinamico | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  function iniciarPreview(tema: TemaDinamico) {
    setPreviewTema(tema)
    setIsPreviewMode(true)
    
    // Aplicar tema de preview
    aplicarTemaPreview(tema)
  }

  function finalizarPreview() {
    setIsPreviewMode(false)
    setPreviewTema(null)
    
    // Remover estilos de preview
    const previewStyles = document.querySelectorAll('[id^="tema-preview-"]')
    previewStyles.forEach(style => style.remove())
  }

  function aplicarTemaPreview(tema: TemaDinamico) {
    // Aplicar CSS com prefixo de preview
    const styleElement = document.createElement('style')
    styleElement.id = `tema-preview-${tema.cache_key}`
    styleElement.textContent = `
      .preview-container {
        ${tema.css_customizado}
      }
    `
    document.head.appendChild(styleElement)
  }

  return {
    previewTema,
    isPreviewMode,
    iniciarPreview,
    finalizarPreview
  }
}

// Mock data
function getMockTema(regiaoId: string): TemaDinamico {
  const temas: Record<string, TemaDinamico> = {
    'sao-paulo-capital': {
      regiao_id: 'sao-paulo-capital',
      identidade_ativa: '1',
      css_customizado: `
        :root {
          --cor-primaria: #1E40AF;
          --cor-secundaria: #3B82F6;
          --cor-acento: #10B981;
          --cor-texto-primario: #1F2937;
          --cor-texto-secundario: #6B7280;
          --cor-fundo-principal: #FFFFFF;
          --cor-fundo-secundario: #F9FAFB;
          --fonte-primaria: 'Inter', sans-serif;
          --fonte-secundaria: 'Inter', sans-serif;
          --espacamento-base: 1rem;
          --border-radius-base: 0.5rem;
        }
        
        .btn-primary {
          background-color: var(--cor-primaria);
          border-color: var(--cor-primaria);
          border-radius: var(--border-radius-base);
        }
        
        .navbar {
          padding: 1rem 1.5rem;
        }
        
        .card {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          border-radius: var(--border-radius-base);
        }
      `,
      css_hash: 'abc123',
      css_variables: {
        '--cor-primaria': '#1E40AF',
        '--cor-secundaria': '#3B82F6',
        '--cor-acento': '#10B981',
        '--cor-texto-primario': '#1F2937',
        '--cor-texto-secundario': '#6B7280',
        '--cor-fundo-principal': '#FFFFFF',
        '--cor-fundo-secundario': '#F9FAFB',
        '--fonte-primaria': 'Inter, sans-serif',
        '--fonte-secundaria': 'Inter, sans-serif',
        '--espacamento-base': '1rem',
        '--border-radius-base': '0.5rem'
      },
      assets_otimizados: {
        logos_webp: {
          principal: '/logos/sp-principal.webp',
          horizontal: '/logos/sp-horizontal.webp',
          simbolo: '/logos/sp-simbolo.webp'
        },
        icones_svg: {},
        fontes_woff2: {
          primaria: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
          secundaria: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
        }
      },
      cache_key: 'tema_sao-paulo-capital_abc123',
      ultima_atualizacao: new Date().toISOString(),
      versao_assets: 1
    }
  }

  return temas[regiaoId] || temas['sao-paulo-capital']
}