import { NextRequest, NextResponse } from 'next/server'
import createPocketBase from '@/lib/pocketbase'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const requestHeaders = new Headers(request.headers)
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
        return response
      }
    } catch {
      /* ignore */
    }
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: '/((?!_next/).*)',
}
