import { headers, cookies } from 'next/headers'
import createPocketBase from '@/lib/pocketbase'
import { defaultConfig, TenantConfig } from '@/lib/context/TenantContext'

export async function fetchTenantConfig(): Promise<TenantConfig> {
  const headerList = headers()
  const cookieStore = cookies()
  const fromCookie = cookieStore.get('tenantId')?.value ?? null

  const pb = createPocketBase()
  try {
    const host = headerList.get('host')?.split(':')[0] ?? ''
    if (host) {
      const rec = await pb
        .collection('clientes_config')
        .getFirstListItem(`dominio='${host}'`)
      if (rec?.cliente) {
        const tenant = String(rec.cliente)
        if (tenant !== fromCookie) {
          cookieStore.set('tenantId', tenant, { path: '/' })
        }
        return {
          font: rec.font || defaultConfig.font,
          primaryColor: rec.cor_primary || defaultConfig.primaryColor,
          logoUrl: rec.logo_url || defaultConfig.logoUrl,
          confirmaInscricoes:
            rec.confirmaInscricoes ??
            rec.confirma_inscricoes ??
            defaultConfig.confirmaInscricoes,
        }
      }
    }

    if (fromCookie) {
      const rec = await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${fromCookie}'`)
      return {
        font: rec.font || defaultConfig.font,
        primaryColor: rec.cor_primary || defaultConfig.primaryColor,
        logoUrl: rec.logo_url || defaultConfig.logoUrl,
        confirmaInscricoes:
          rec.confirmaInscricoes ??
          rec.confirma_inscricoes ??
          defaultConfig.confirmaInscricoes,
      }
    }

    return defaultConfig
  } catch {
    return defaultConfig
  }
}
