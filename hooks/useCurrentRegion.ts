import { useEffect, useState } from 'react'
import type { RegionDetectionResult } from '../lib/services/subdomain-detection'

export function useCurrentRegion() {
  const [region, setRegion] = useState<RegionDetectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    detectCurrentRegion()
  }, [])

  async function detectCurrentRegion() {
    setLoading(true)
    setError(null)

    try {
      // 1. Tentar buscar dos cookies (definidos pelo middleware)
      const regionFromCookies = getRegionFromCookies()
      if (regionFromCookies.isValid) {
        setRegion(regionFromCookies)
        setLoading(false)
        return
      }

      // 2. Tentar buscar dos headers da resposta
      const regionFromHeaders = getRegionFromHeaders()
      if (regionFromHeaders.isValid) {
        setRegion(regionFromHeaders)
        setLoading(false)
        return
      }

      // 3. Tentar detectar pelo hostname atual
      const hostname = window.location.hostname
      const regionFromHostname = await detectFromHostname(hostname)
      setRegion(regionFromHostname)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao detectar região')
      setRegion(getDefaultRegion())
    } finally {
      setLoading(false)
    }
  }

  function getRegionFromCookies(): RegionDetectionResult {
    if (typeof document === 'undefined') {
      return getDefaultRegion()
    }

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const regionId = cookies.regionId || ''
    const estadoId = cookies.estadoId || ''
    const cidadeId = cookies.cidadeId || ''
    const subdomain = cookies.subdomain || ''
    const tenantId = cookies.tenantId || ''

    if (regionId && estadoId && cidadeId) {
      return {
        subdomain,
        regionId,
        estadoId,
        cidadeId,
        tenantId,
        config: null,
        isValid: true
      }
    }

    return getDefaultRegion()
  }

  function getRegionFromHeaders(): RegionDetectionResult {
    // Esta função seria útil em SSR, mas no cliente não temos acesso aos headers originais
    // Em componentes cliente, dependemos dos cookies
    return getDefaultRegion()
  }

  async function detectFromHostname(hostname: string): Promise<RegionDetectionResult> {
    try {
      // Fazer chamada para API que usa a detecção de subdomínio
      const response = await fetch('/api/region/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname })
      })

      if (!response.ok) {
        throw new Error('Erro ao detectar região via API')
      }

      const result = await response.json()
      return result.region || getDefaultRegion()
    } catch (error) {
      console.warn('Erro ao detectar região via hostname:', error)
      return getDefaultRegion()
    }
  }

  function getDefaultRegion(): RegionDetectionResult {
    return {
      subdomain: 'www',
      regionId: null,
      estadoId: null,
      cidadeId: null,
      tenantId: 'default',
      config: null,
      isValid: false,
      error: 'Região não detectada'
    }
  }

  function getTerritory() {
    if (!region || !region.isValid) {
      return {
        estado_id: '',
        regiao_id: '',
        cidade_id: ''
      }
    }

    return {
      estado_id: region.estadoId || '',
      regiao_id: region.regionId || '',
      cidade_id: region.cidadeId || ''
    }
  }

  function getTerritoryInfo() {
    const territory = getTerritory()
    
    return {
      ...territory,
      subdomain: region?.subdomain || '',
      tenantId: region?.tenantId || 'default',
      isValid: region?.isValid || false,
      config: region?.config || null
    }
  }

  return {
    region,
    territory: getTerritory(),
    territoryInfo: getTerritoryInfo(),
    loading,
    error,
    refresh: detectCurrentRegion,
    isValid: region?.isValid || false,
    subdomain: region?.subdomain || '',
    tenantId: region?.tenantId || 'default'
  }
}

// Hook para obter apenas o território (mais simples)
export function useTerritory() {
  const { territory, loading, error, isValid } = useCurrentRegion()
  
  return {
    territory,
    loading,
    error,
    isValid
  }
}

// Hook para verificar se está em uma região específica
export function useRegionCheck(targetRegionId: string) {
  const { region, loading } = useCurrentRegion()
  
  const isTargetRegion = region?.regionId === targetRegionId
  const isValidRegion = region?.isValid && Boolean(region.regionId)
  
  return {
    isTargetRegion,
    isValidRegion,
    loading,
    currentRegionId: region?.regionId || null
  }
}

// Hook para componentes que precisam de dados da região
export function useRegionData() {
  const { region, territoryInfo, loading, error } = useCurrentRegion()
  
  const regionData = {
    id: region?.regionId || '',
    name: getRegionName(region?.regionId),
    estado: {
      id: region?.estadoId || '',
      name: getEstadoName(region?.estadoId)
    },
    cidade: {
      id: region?.cidadeId || '',
      name: getCidadeName(region?.cidadeId)
    },
    subdomain: region?.subdomain || '',
    config: region?.config || null
  }

  return {
    regionData,
    territoryInfo,
    loading,
    error,
    isValid: region?.isValid || false
  }
}

// Funções helper para nomes amigáveis
function getRegionName(regionId?: string | null): string {
  const names: Record<string, string> = {
    'sao-paulo-capital': 'São Paulo Capital',
    'rio-de-janeiro-capital': 'Rio de Janeiro Capital',
    'belo-horizonte': 'Belo Horizonte',
    'distrito-federal': 'Distrito Federal',
    'salvador': 'Salvador',
    'fortaleza': 'Fortaleza',
    'recife': 'Recife',
    'porto-alegre': 'Porto Alegre',
    'curitiba': 'Curitiba'
  }
  
  return names[regionId || ''] || regionId || 'Região não identificada'
}

function getEstadoName(estadoId?: string | null): string {
  const names: Record<string, string> = {
    'sao-paulo': 'São Paulo',
    'rio-de-janeiro': 'Rio de Janeiro',
    'minas-gerais': 'Minas Gerais',
    'distrito-federal': 'Distrito Federal',
    'bahia': 'Bahia',
    'ceara': 'Ceará',
    'pernambuco': 'Pernambuco',
    'rio-grande-do-sul': 'Rio Grande do Sul',
    'parana': 'Paraná'
  }
  
  return names[estadoId || ''] || estadoId || 'Estado não identificado'
}

function getCidadeName(cidadeId?: string | null): string {
  const names: Record<string, string> = {
    'sao-paulo-capital': 'São Paulo',
    'rio-de-janeiro-capital': 'Rio de Janeiro',
    'belo-horizonte': 'Belo Horizonte',
    'brasilia': 'Brasília',
    'salvador': 'Salvador',
    'fortaleza': 'Fortaleza',
    'recife': 'Recife',
    'porto-alegre': 'Porto Alegre',
    'curitiba': 'Curitiba'
  }
  
  return names[cidadeId || ''] || cidadeId || 'Cidade não identificada'
}