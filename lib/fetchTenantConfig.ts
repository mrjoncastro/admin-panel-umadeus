import { headers } from 'next/headers'
import createPocketBase from '@/lib/pocketbase'
import { defaultConfig, TenantConfig } from '@/lib/context/TenantContext'

export async function fetchTenantConfig(): Promise<TenantConfig> {
  const headerList = await headers()
  const direct = headerList.get('x-tenant-id')
  const cookieHeader = headerList.get('cookie') ?? ''
  const cookieMatch = cookieHeader.match(/tenantId=([^;]+)/)
  const fromCookie = cookieMatch ? cookieMatch[1] : null

  const pb = createPocketBase()
  try {
    if (direct || fromCookie) {
      const rec = await pb
        .collection('clientes_config')
        .getFirstListItem(`cliente='${direct || fromCookie}'`)
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
    const host = headerList.get('host')?.split(':')[0] ?? ''
    if (!host) return defaultConfig
    const rec = await pb
      .collection('clientes_config')
      .getFirstListItem(`dominio='${host}'`)
    return {
      font: rec.font || defaultConfig.font,
      primaryColor: rec.cor_primary || defaultConfig.primaryColor,
      logoUrl: rec.logo_url || defaultConfig.logoUrl,
      confirmaInscricoes:
        rec.confirmaInscricoes ??
        rec.confirma_inscricoes ??
        defaultConfig.confirmaInscricoes,
    }
  } catch {
    return defaultConfig
  }
}
