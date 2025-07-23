import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? ''
  const requestHeaders = new Headers(request.headers)
  
  if (host) {
    try {
      const { data: clienteConfig } = await supabase
        .from('clientes_config')
        .select('cliente')
        .eq('dominio', host)
        .single()
      
      if (clienteConfig?.cliente) {
        requestHeaders.set('x-tenant-id', String(clienteConfig.cliente))
        const response = NextResponse.next({
          request: { headers: requestHeaders },
        })
        response.cookies.set('tenantId', String(clienteConfig.cliente), { path: '/' })
        return response
      }
    } catch (error) {
      console.error('Middleware error:', error)
    }
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: '/((?!_next/).*)',
}
