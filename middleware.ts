import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

// Cache para configurações de tenant (host -> tenantId)
const tenantConfigCache = new Map<string, string>()

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const requestHeaders = new Headers(request.headers)
  
  if (host) {
    try {
      // Verifica cache primeiro
      let tenantId = tenantConfigCache.get(host)
      
      if (!tenantId) {
        // Consulta configuração no banco único
        const pb = createPocketBase()
        const cfg = await pb
          .collection('clientes_config')
          .getFirstListItem(`dominio='${host}'`)
          
        if (cfg?.cliente) {
          tenantId = String(cfg.cliente)
          
          // Cache por 5 minutos para otimizar performance
          tenantConfigCache.set(host, tenantId)
          setTimeout(() => tenantConfigCache.delete(host), 5 * 60 * 1000)
        }
      }
      
      if (tenantId) {
        // Injeta header do tenant para identificação nas APIs
        requestHeaders.set('x-tenant-id', tenantId)
        
        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })
        
        // Cookie para o frontend acessar o tenantId
        response.cookies.set('tenantId', tenantId, { path: '/' })
        
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
