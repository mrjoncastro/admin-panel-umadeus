// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Produto } from '@/types'

export async function getProductBySlug(slug: string): Promise<Produto | null> {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  try {
    const prod = await pb
      .collection('produtos')
      .getFirstListItem<Produto>(`slug='${slug}' && cliente='${tenantId}'`)
    const imagens = Array.isArray(prod.imagens)
      ? (prod.imagens || []).map((img) => // pb. // [REMOVED] files.getURL(prod, img))
      : Object.fromEntries(
          Object.entries((prod.imagens ?? {}) as Record<string, string[]>).map(
            ([g, arr]) => [g, arr.map((img) => // pb. // [REMOVED] files.getURL(prod, img))],
          ),
        )
    return { ...(prod as unknown as Produto), imagens } as Produto
  } catch {
    return null
  }
}
