import PocketBase from 'pocketbase'

const DEFAULT_PB_URL = 'http://127.0.0.1:8090'

const PB_URL = process.env.PB_URL || DEFAULT_PB_URL

if (!process.env.PB_URL) {
  console.warn(`PB_URL não configurada. Usando valor padrão: ${DEFAULT_PB_URL}`)
}

// Cache de instâncias PocketBase por tenant
const tenantPbInstances = new Map<string, PocketBase>()

// Configuração de URLs de banco por tenant
const tenantDatabaseUrls = new Map<string, string>()

// Função para registrar URL de banco específico por tenant
export function registerTenantDatabase(tenantId: string, databaseUrl: string) {
  tenantDatabaseUrls.set(tenantId, databaseUrl)
  // Remove instância em cache para forçar recriação com nova URL
  tenantPbInstances.delete(tenantId)
}

// Função para obter URL do banco por tenant
export function getTenantDatabaseUrl(tenantId?: string): string {
  if (!tenantId) return PB_URL
  
  // Verifica se há URL específica para o tenant
  const tenantUrl = tenantDatabaseUrls.get(tenantId)
  if (tenantUrl) {
    return tenantUrl
  }
  
  // Verifica variável de ambiente específica do tenant
  const envVar = `PB_URL_TENANT_${tenantId.toUpperCase()}`
  const tenantEnvUrl = process.env[envVar]
  if (tenantEnvUrl) {
    tenantDatabaseUrls.set(tenantId, tenantEnvUrl)
    return tenantEnvUrl
  }
  
  // Fallback para URL padrão
  return PB_URL
}

const basePb = new PocketBase(PB_URL)

export function createPocketBase(copyAuth = true, tenantId?: string) {
  const databaseUrl = getTenantDatabaseUrl(tenantId)
  
  // Se tem tenant específico, gerencia instância em cache
  if (tenantId && databaseUrl !== PB_URL) {
    let tenantPb = tenantPbInstances.get(tenantId)
    
    if (!tenantPb) {
      tenantPb = new PocketBase(databaseUrl)
      tenantPb.beforeSend = (url, opt) => {
        opt.credentials = 'include'
        return { url, options: opt }
      }
      tenantPb.autoCancellation(false)
      tenantPbInstances.set(tenantId, tenantPb)
    }
    
    // Cria uma nova instância ou clona
    const pbWithClone = tenantPb as PocketBase & { clone?: () => PocketBase }
    const pb = typeof pbWithClone.clone === 'function'
      ? pbWithClone.clone()
      : new PocketBase(databaseUrl)
      
    if (copyAuth && tenantPb.authStore.token) {
      pb.authStore.save(tenantPb.authStore.token, tenantPb.authStore.model)
    } else if (!copyAuth) {
      pb.authStore.clear()
    }
    
    pb.beforeSend = (url, opt) => {
      opt.credentials = 'include'
      return { url, options: opt }
    }
    pb.autoCancellation(false)
    
    return pb
  }
  
  // Comportamento original para tenant padrão
  const pbWithClone = basePb as PocketBase & { clone?: () => PocketBase }
  const pb =
    typeof pbWithClone.clone === 'function'
      ? pbWithClone.clone()
      : new PocketBase(PB_URL)
  if (copyAuth) {
    pb.authStore.save(basePb.authStore.token, basePb.authStore.model)
  } else {
    pb.authStore.clear()
  }
  pb.beforeSend = (url, opt) => {
    opt.credentials = 'include'
    return { url, options: opt }
  }
  pb.autoCancellation(false)
  return pb
}

export function updateBaseAuth(
  token: string,
  model: Parameters<typeof basePb.authStore.save>[1],
  tenantId?: string,
) {
  if (tenantId) {
    const tenantPb = tenantPbInstances.get(tenantId)
    if (tenantPb) {
      tenantPb.authStore.save(token, model)
    }
  }
  basePb.authStore.save(token, model)
}

export function clearBaseAuth(tenantId?: string) {
  if (tenantId) {
    const tenantPb = tenantPbInstances.get(tenantId)
    if (tenantPb) {
      tenantPb.authStore.clear()
    }
  }
  basePb.authStore.clear()
}

// Função para limpar cache de tenant (útil para testes ou reconfiguração)
export function clearTenantCache(tenantId?: string) {
  if (tenantId) {
    tenantPbInstances.delete(tenantId)
    tenantDatabaseUrls.delete(tenantId)
  } else {
    tenantPbInstances.clear()
    tenantDatabaseUrls.clear()
  }
}

export default createPocketBase
