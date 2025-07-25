import type PocketBase from 'pocketbase'
import createPocketBase from '../pocketbase'

// Tipos para detecção de subdomínio
export type RegionDetectionResult = {
  subdomain: string
  regionId: string | null
  estadoId: string | null
  cidadeId: string | null
  tenantId: string | null
  config: RegionConfig | null
  isValid: boolean
  error?: string
}

export type RegionConfig = {
  id: string
  subdomain: string
  regiao_id: string
  estado_id: string
  cidade_id: string
  tenant_id: string
  ativo: boolean
  configuracoes: {
    identidade_visual_id?: string
    tema_customizado?: boolean
    produtos_exclusivos?: boolean
    comissao_override?: {
      lider_local: number
      coordenador_regional: number
      coordenador_geral: number
    }
  }
  seo: {
    titulo_site: string
    descricao_meta: string
    palavras_chave: string[]
    favicon_url?: string
  }
  contato: {
    telefone?: string
    email?: string
    endereco?: string
    horario_funcionamento?: string
  }
  created: string
  updated: string
}

// Cache em memória para subdomínios (em produção usar Redis)
const subdomainCache = new Map<string, RegionDetectionResult>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// ========== DETECÇÃO DE REGIÃO POR SUBDOMÍNIO ==========

export async function detectRegionFromSubdomain(
  hostname: string,
  pb?: PocketBase
): Promise<RegionDetectionResult> {
  const subdomain = extractSubdomain(hostname)
  
  // Verificar cache primeiro
  const cacheKey = `subdomain:${subdomain}`
  const cached = subdomainCache.get(cacheKey)
  
  if (cached && (Date.now() - (cached as any).cachedAt) < CACHE_TTL) {
    return cached
  }
  
  try {
    const client = pb ?? createPocketBase()
    
    // Buscar configuração da região pelo subdomínio
    const regionConfig = await client
      .collection('regioes_subdominios')
      .getFirstListItem(
        `subdomain = "${subdomain}" && ativo = true`,
        { expand: 'regiao_id,estado_id,cidade_id' }
      ) as RegionConfig
    
    const result: RegionDetectionResult = {
      subdomain,
      regionId: regionConfig.regiao_id,
      estadoId: regionConfig.estado_id,
      cidadeId: regionConfig.cidade_id,
      tenantId: regionConfig.tenant_id,
      config: regionConfig,
      isValid: true
    }
    
    // Adicionar ao cache
    ;(result as any).cachedAt = Date.now()
    subdomainCache.set(cacheKey, result)
    
    return result
    
  } catch (error) {
    // Se não encontrou configuração, tentar padrões conhecidos
    const fallbackResult = tryFallbackDetection(subdomain)
    
    if (!fallbackResult.isValid) {
      console.warn(`Subdomínio não encontrado: ${subdomain}`, error)
    }
    
    // Cache resultado mesmo se inválido (por pouco tempo)
    ;(fallbackResult as any).cachedAt = Date.now()
    subdomainCache.set(cacheKey, fallbackResult)
    
    return fallbackResult
  }
}

export function extractSubdomain(hostname: string): string {
  // Remove porta se houver
  const cleanHost = hostname.split(':')[0]
  
  // Lista de domínios base conhecidos
  const baseDomains = [
    'localhost',
    'vercel.app',
    'railway.app',
    'herokuapp.com',
    'm24vendas.com.br',
    'm24vendas.com'
  ]
  
  // Verifica se é localhost ou IP
  if (cleanHost === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHost)) {
    return 'localhost'
  }
  
  // Separa as partes do domínio
  const parts = cleanHost.split('.')
  
  // Se tem menos de 2 partes, retorna o hostname completo
  if (parts.length < 2) {
    return cleanHost
  }
  
  // Verifica se o domínio base está na lista conhecida
  for (const baseDomain of baseDomains) {
    if (cleanHost.endsWith(baseDomain)) {
      // Se o hostname é exatamente o domínio base, não há subdomínio
      if (cleanHost === baseDomain) {
        return 'www' // Domínio principal
      }
      
      // Extrai o subdomínio
      const subdomain = cleanHost.replace(`.${baseDomain}`, '')
      
      // Remove 'www' se for o único subdomínio
      if (subdomain === 'www') {
        return 'www'
      }
      
      return subdomain
    }
  }
  
  // Se não reconheceu o domínio base, assume que a primeira parte é o subdomínio
  return parts[0] === 'www' ? 'www' : parts[0]
}

function tryFallbackDetection(subdomain: string): RegionDetectionResult {
  // Padrões conhecidos de subdomínios regionais
  const knownPatterns: Record<string, Partial<RegionDetectionResult>> = {
    'saopaulo': {
      regionId: 'sao-paulo-capital',
      estadoId: 'sao-paulo',
      cidadeId: 'sao-paulo-capital'
    },
    'sp': {
      regionId: 'sao-paulo-capital', 
      estadoId: 'sao-paulo',
      cidadeId: 'sao-paulo-capital'
    },
    'rio': {
      regionId: 'rio-de-janeiro-capital',
      estadoId: 'rio-de-janeiro',
      cidadeId: 'rio-de-janeiro-capital'
    },
    'rj': {
      regionId: 'rio-de-janeiro-capital',
      estadoId: 'rio-de-janeiro', 
      cidadeId: 'rio-de-janeiro-capital'
    },
    'bh': {
      regionId: 'belo-horizonte',
      estadoId: 'minas-gerais',
      cidadeId: 'belo-horizonte'
    },
    'brasilia': {
      regionId: 'distrito-federal',
      estadoId: 'distrito-federal',
      cidadeId: 'brasilia'
    },
    'salvador': {
      regionId: 'salvador',
      estadoId: 'bahia',
      cidadeId: 'salvador'
    },
    'fortaleza': {
      regionId: 'fortaleza',
      estadoId: 'ceara',
      cidadeId: 'fortaleza'
    },
    'recife': {
      regionId: 'recife',
      estadoId: 'pernambuco',
      cidadeId: 'recife'
    },
    'portoalegre': {
      regionId: 'porto-alegre',
      estadoId: 'rio-grande-do-sul',
      cidadeId: 'porto-alegre'
    },
    'curitiba': {
      regionId: 'curitiba',
      estadoId: 'parana',
      cidadeId: 'curitiba'
    }
  }
  
  const pattern = knownPatterns[subdomain.toLowerCase()]
  
  if (pattern) {
    return {
      subdomain,
      regionId: pattern.regionId || null,
      estadoId: pattern.estadoId || null,
      cidadeId: pattern.cidadeId || null,
      tenantId: subdomain, // Usar subdomain como tenant fallback
      config: null,
      isValid: true
    }
  }
  
  return {
    subdomain,
    regionId: null,
    estadoId: null,
    cidadeId: null,
    tenantId: null,
    config: null,
    isValid: false,
    error: `Subdomínio não reconhecido: ${subdomain}`
  }
}

// ========== GESTÃO DE CONFIGURAÇÕES REGIONAIS ==========

export async function createRegionSubdomain(
  config: Omit<RegionConfig, 'id' | 'created' | 'updated'>,
  pb?: PocketBase
): Promise<RegionConfig> {
  const client = pb ?? createPocketBase()
  
  // Validar se o subdomínio não está em uso
  const existing = await checkSubdomainAvailability(config.subdomain, pb)
  if (!existing.available) {
    throw new Error(`Subdomínio '${config.subdomain}' já está em uso`)
  }
  
  const result = await client.collection('regioes_subdominios').create(config)
  
  // Limpar cache
  clearSubdomainCache(config.subdomain)
  
  return result
}

export async function updateRegionSubdomain(
  id: string,
  updates: Partial<RegionConfig>,
  pb?: PocketBase
): Promise<RegionConfig> {
  const client = pb ?? createPocketBase()
  
  // Se mudou o subdomínio, validar disponibilidade
  if (updates.subdomain) {
    const existing = await checkSubdomainAvailability(updates.subdomain, pb)
    if (!existing.available && existing.existingId !== id) {
      throw new Error(`Subdomínio '${updates.subdomain}' já está em uso`)
    }
  }
  
  const result = await client.collection('regioes_subdominios').update(id, updates)
  
  // Limpar cache
  if (updates.subdomain) {
    clearSubdomainCache(updates.subdomain)
  }
  
  return result
}

export async function checkSubdomainAvailability(
  subdomain: string,
  pb?: PocketBase
): Promise<{ available: boolean; existingId?: string }> {
  const client = pb ?? createPocketBase()
  
  try {
    const existing = await client
      .collection('regioes_subdominios')
      .getFirstListItem(`subdomain = "${subdomain}"`)
    
    return {
      available: false,
      existingId: existing.id
    }
  } catch {
    return { available: true }
  }
}

export async function listRegionSubdomains(
  filters?: {
    estado_id?: string
    regiao_id?: string
    ativo?: boolean
  },
  pb?: PocketBase
): Promise<RegionConfig[]> {
  const client = pb ?? createPocketBase()
  
  let filter = ''
  const conditions: string[] = []
  
  if (filters?.estado_id) {
    conditions.push(`estado_id = "${filters.estado_id}"`)
  }
  
  if (filters?.regiao_id) {
    conditions.push(`regiao_id = "${filters.regiao_id}"`)
  }
  
  if (filters?.ativo !== undefined) {
    conditions.push(`ativo = ${filters.ativo}`)
  }
  
  if (conditions.length > 0) {
    filter = conditions.join(' && ')
  }
  
  return client.collection('regioes_subdominios').getFullList({
    filter,
    sort: 'subdomain',
    expand: 'regiao_id,estado_id,cidade_id'
  })
}

// ========== UTILITIES ==========

export function clearSubdomainCache(subdomain?: string) {
  if (subdomain) {
    subdomainCache.delete(`subdomain:${subdomain}`)
  } else {
    subdomainCache.clear()
  }
}

export function getRegionTerritory(detection: RegionDetectionResult) {
  return {
    estado_id: detection.estadoId || '',
    regiao_id: detection.regionId || '',
    cidade_id: detection.cidadeId || ''
  }
}

export function isValidRegion(detection: RegionDetectionResult): boolean {
  return detection.isValid && 
         Boolean(detection.regionId) && 
         Boolean(detection.estadoId) && 
         Boolean(detection.cidadeId)
}

// Mock data para desenvolvimento
export function getMockRegionConfigs(): RegionConfig[] {
  return [
    {
      id: '1',
      subdomain: 'saopaulo',
      regiao_id: 'sao-paulo-capital',
      estado_id: 'sao-paulo',
      cidade_id: 'sao-paulo-capital',
      tenant_id: 'saopaulo',
      ativo: true,
      configuracoes: {
        identidade_visual_id: 'tema_sp_1',
        tema_customizado: true,
        produtos_exclusivos: true,
        comissao_override: {
          lider_local: 15,
          coordenador_regional: 8,
          coordenador_geral: 5
        }
      },
      seo: {
        titulo_site: 'M24 Vendas São Paulo - Marketplace Regional',
        descricao_meta: 'A maior plataforma de vendas da região de São Paulo',
        palavras_chave: ['marketplace', 'sao paulo', 'vendas', 'produtos locais']
      },
      contato: {
        telefone: '(11) 99999-9999',
        email: 'saopaulo@m24vendas.com.br',
        endereco: 'Av. Paulista, 1000 - São Paulo/SP',
        horario_funcionamento: 'Segunda a Sexta: 8h às 18h'
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    {
      id: '2',
      subdomain: 'rio',
      regiao_id: 'rio-de-janeiro-capital',
      estado_id: 'rio-de-janeiro',
      cidade_id: 'rio-de-janeiro-capital',
      tenant_id: 'rio',
      ativo: true,
      configuracoes: {
        identidade_visual_id: 'tema_rj_1',
        tema_customizado: true,
        produtos_exclusivos: false
      },
      seo: {
        titulo_site: 'M24 Vendas Rio de Janeiro - Cidade Maravilhosa',
        descricao_meta: 'Produtos e serviços locais do Rio de Janeiro',
        palavras_chave: ['marketplace', 'rio de janeiro', 'produtos cariocas']
      },
      contato: {
        telefone: '(21) 99999-9999',
        email: 'rio@m24vendas.com.br'
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
  ]
}