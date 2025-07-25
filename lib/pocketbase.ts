import PocketBase from 'pocketbase'
import { headers } from 'next/headers'

const DEFAULT_PB_URL = 'http://127.0.0.1:8090'

const PB_URL = process.env.PB_URL || DEFAULT_PB_URL

if (!process.env.PB_URL) {
  console.warn(`PB_URL não configurada. Usando valor padrão: ${DEFAULT_PB_URL}`)
}

const basePb = new PocketBase(PB_URL)

export function createPocketBase(copyAuth = true) {
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
) {
  basePb.authStore.save(token, model)
}

export function clearBaseAuth() {
  basePb.authStore.clear()
}

// Função utilitária para obter o tenant ID atual
export function getCurrentTenantId(): string | null {
  try {
    const headersList = headers()
    return headersList.get('x-tenant-id')
  } catch {
    // Fallback para cookies no lado cliente
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const tenantCookie = cookies.find(cookie => 
        cookie.trim().startsWith('tenantId=')
      )
      return tenantCookie ? tenantCookie.split('=')[1] : null
    }
    return null
  }
}

// Função utilitária para adicionar filtro de tenant automaticamente
export function addTenantFilter(filter: string, tenantId?: string): string {
  const currentTenantId = tenantId || getCurrentTenantId()
  if (!currentTenantId) {
    return filter
  }
  
  const tenantFilter = `cliente='${currentTenantId}'`
  
  if (!filter || filter.trim() === '') {
    return tenantFilter
  }
  
  return `${tenantFilter} && (${filter})`
}

// Função para criar PocketBase com contexto de tenant
export function createTenantPocketBase(copyAuth = true, tenantId?: string) {
  const pb = createPocketBase(copyAuth)
  const currentTenantId = tenantId || getCurrentTenantId()
  
  if (currentTenantId) {
    // Adiciona interceptor para filtros automáticos de tenant
    const originalCollection = pb.collection
    pb.collection = function(idOrName: string) {
      const collection = originalCollection.call(this, idOrName)
      
      // Lista de coleções que têm campo 'cliente' para filtro automático
      const tenantCollections = [
        'produtos', 'posts', 'pedidos', 'inscricoes', 'eventos',
        'clientes_pix', 'clientes_contas_bancarias', 'clientes_config',
        'categorias', 'campos', 'usuarios', 'manifesto_clientes'
      ]
      
      if (tenantCollections.includes(idOrName)) {
        // Override dos métodos de listagem para adicionar filtro automático
        const originalGetList = collection.getList
        const originalGetFirstListItem = collection.getFirstListItem
        const originalGetFullList = collection.getFullList
        
        collection.getList = function(page?: number, perPage?: number, options?: any) {
          const filter = options?.filter || ''
          const newOptions = {
            ...options,
            filter: addTenantFilter(filter, currentTenantId)
          }
          return originalGetList.call(this, page, perPage, newOptions)
        }
        
        collection.getFirstListItem = function(filter?: string, options?: any) {
          const newFilter = addTenantFilter(filter || '', currentTenantId)
          return originalGetFirstListItem.call(this, newFilter, options)
        }
        
        collection.getFullList = function(options?: any) {
          const filter = options?.filter || ''
          const newOptions = {
            ...options,
            filter: addTenantFilter(filter, currentTenantId)
          }
          return originalGetFullList.call(this, newOptions)
        }
      }
      
      return collection
    }
  }
  
  return pb
}

export default createPocketBase
