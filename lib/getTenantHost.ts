import createPocketBase from '@/lib/pocketbase'

/**
 * Retorna o host configurado para o tenant informado.
 * Remove barras extras ao final para evitar urls duplicadas.
 */
interface ClienteConfig {
  host?: string
  dominio?: string
}

export async function getTenantHost(tenantId: string): Promise<string | null> {
  try {
    const pb = createPocketBase()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem<ClienteConfig>(`cliente='${tenantId}'`)
    const rawHost = cfg.host ?? cfg.dominio ?? ''
    let host = String(rawHost).replace(/\/+$/, '')
    if (!host) return null
    if (!/^https?:\/\//.test(host)) {
      host = `https://${host}`
    }
    return host
  } catch {
    return null
  }
}
