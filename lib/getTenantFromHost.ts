import { headers } from 'next/headers'
import createPocketBase from '@/lib/pocketbase'

export async function getTenantFromHost(): Promise<string | null> {
  try {
    const headerList = await headers()
    const direct = headerList.get('x-tenant-id')
    if (direct) return direct

    const cookieHeader = headerList.get('cookie') ?? ''
    const match = cookieHeader.match(/tenantId=([^;]+)/)
    if (match) return match[1]

    const host = headerList.get('host')?.split(':')[0] ?? ''
    if (!host) return null

    const pb = createPocketBase()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`dominio='${host}'`)
    return cfg?.cliente ?? null
  } catch {
    return null
  }
}
