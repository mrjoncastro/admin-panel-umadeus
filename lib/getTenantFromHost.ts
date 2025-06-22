import { headers, cookies } from 'next/headers'
import createPocketBase from '@/lib/pocketbase'

export async function getTenantFromHost(): Promise<string | null> {
  try {
    const headerList = await headers()
    const cookieStore = await cookies()
    const cookieTenant = cookieStore.get('tenantId')?.value ?? null

    const host = headerList.get('host')?.split(':')[0] ?? ''

    if (host) {
      try {
        const pb = createPocketBase()
        const cfg = await pb
          .collection('clientes_config')
          .getFirstListItem(`dominio='${host}'`)

        if (cfg?.cliente) {
          const tenant = String(cfg.cliente)
          if (tenant !== cookieTenant) {
            cookieStore.set('tenantId', tenant, { path: '/' })
          }
          return tenant
        }
      } catch {
        /* ignore */
      }
    }

    if (cookieTenant) return cookieTenant
    return null
  } catch {
    return null
  }
}
