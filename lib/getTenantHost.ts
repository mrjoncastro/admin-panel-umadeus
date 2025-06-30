import createPocketBase from '@/lib/pocketbase'

/**
 * Retorna o host configurado para o tenant informado.
 * Remove barras extras ao final para evitar urls duplicadas.
 */
export async function getTenantHost(tenantId: string): Promise<string | null> {
  try {
    const pb = createPocketBase()
    const cfg = await pb
      .collection('clientes_config')
      .getFirstListItem(`cliente='${tenantId}'`)
    const rawHost = (cfg as any).host ?? (cfg as any).dominio ?? ''
    const host = String(rawHost).replace(/\/+$/, '')
    return host || null
  } catch {
    return null
  }
}
