import createPocketBase from '@/lib/pocketbase'

/**
 * Retorna o host configurado para o tenant informado.
 * Remove barras extras ao final para evitar urls duplicadas.
 */
interface ClienteConfigRecord {
  id: string
  cliente: string
  host?: string
  dominio?: string
}

export async function getTenantHost(tenantId: string): Promise<string | null> {
  try {
    const pb = createPocketBase()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem<ClienteConfigRecord>(`cliente='${tenantId}'`)
    const rawHost = cfg.host ?? cfg.dominio ?? ''
    const host = String(rawHost).replace(/\/+$/, '')
    return host || null
  } catch {
    return null
  }
}
