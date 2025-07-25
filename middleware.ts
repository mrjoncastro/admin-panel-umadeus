import { NextRequest, NextResponse } from 'next/server'
import createPocketBase, { getTenantDatabaseUrl, registerTenantDatabase } from '@/lib/pocketbase'

// Cache para configurações de tenant
const tenantConfigCache = new Map<string, { tenantId: string; databaseUrl?: string }>()

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const requestHeaders = new Headers(request.headers)
  
  if (host) {
    try {
      // Verifica cache primeiro
      let tenantConfig = tenantConfigCache.get(host)
      
      if (!tenantConfig) {
        // Consulta configuração usando banco padrão
        const pb = createPocketBase()
        const cfg = await pb
          .collection('clientes_config')
          .getFirstListItem(`dominio='${host}'`, {
            expand: 'cliente'
          })
          
        if (cfg?.cliente) {
          tenantConfig = {
            tenantId: String(cfg.cliente),
            databaseUrl: cfg.database_url || undefined
          }
          
          // Se há URL de banco específica, registra
          if (cfg.database_url) {
            registerTenantDatabase(tenantConfig.tenantId, cfg.database_url)
          }
          
          // Cache por 5 minutos
          tenantConfigCache.set(host, tenantConfig)
          setTimeout(() => tenantConfigCache.delete(host), 5 * 60 * 1000)
        }
      }
      
      if (tenantConfig) {
        // Injeta headers do tenant
        requestHeaders.set('x-tenant-id', tenantConfig.tenantId)
        requestHeaders.set('x-tenant-database-url', getTenantDatabaseUrl(tenantConfig.tenantId))
        
        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })
        
        // Cookies para o frontend
        response.cookies.set('tenantId', tenantConfig.tenantId, { path: '/' })
        if (tenantConfig.databaseUrl) {
          response.cookies.set('tenantDatabaseUrl', tenantConfig.databaseUrl, { 
            path: '/', 
            httpOnly: true // Segurança: não expor URL do banco no frontend
          })
        }
        
        return response
      }
    } catch (error) {
      console.error('Erro no middleware de tenant:', error)
      // Em caso de erro, continua sem configuração de tenant
    }
  }
  
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: '/((?!_next/).*)',
}
