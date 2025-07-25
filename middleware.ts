import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'
import { checkRateLimit, getClientId, RATE_LIMITS } from '@/lib/rateLimiting'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const requestHeaders = new Headers(request.headers)

  // Rate limiting baseado na rota
  let rateLimitKey: keyof typeof RATE_LIMITS | null = null
  
  if (pathname.startsWith('/api/')) {
    if (pathname.includes('/checkout') || pathname.includes('/pagamento')) {
      rateLimitKey = 'api_checkout'
    } else if (pathname.includes('/upload')) {
      rateLimitKey = 'api_upload'
    } else if (pathname.includes('/busca') || pathname.includes('/search')) {
      rateLimitKey = 'api_busca'
    } else if (pathname.includes('/produtos')) {
      rateLimitKey = 'api_produtos'
    } else {
      rateLimitKey = 'api_geral'
    }
  } else if (pathname.startsWith('/vendor/')) {
    rateLimitKey = 'vendor_dashboard'
  } else if (pathname.startsWith('/admin/marketplace/')) {
    rateLimitKey = 'admin_marketplace'
  } else if (pathname.startsWith('/loja/') || pathname.startsWith('/marketplace/')) {
    rateLimitKey = 'marketplace_public'
  }

  // Aplicar rate limiting se necessário
  if (rateLimitKey) {
    const clientId = getClientId(request)
    const rateLimitResult = await checkRateLimit(clientId, rateLimitKey)
    
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Muitas requisições. Tente novamente em ${rateLimitResult.retryAfter} segundos.`,
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter!.toString()
          }
        }
      )
    }
  }

  // Buscar configuração do tenant
  if (host) {
    try {
      const pb = createPocketBase()
      const cfg = await pb
        .collection('clientes_config')
        .getFirstListItem(`dominio='${host}'`)
      if (cfg?.cliente) {
        requestHeaders.set('x-tenant-id', String(cfg.cliente))
        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })
        response.cookies.set('tenantId', String(cfg.cliente), { path: '/' })
        
        // Adicionar headers de rate limiting na resposta
        if (rateLimitKey) {
          const clientId = getClientId(request)
          const rateLimitResult = await checkRateLimit(clientId, rateLimitKey)
          
          response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
          response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
          response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
        }
        
        return response
      }
    } catch {
      /* ignore */
    }
  }
  
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  
  // Adicionar headers de rate limiting mesmo sem tenant
  if (rateLimitKey) {
    const clientId = getClientId(request)
    const rateLimitResult = await checkRateLimit(clientId, rateLimitKey)
    
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
  }
  
  return response
}

export const config = {
  matcher: '/((?!_next/).*)',
}
