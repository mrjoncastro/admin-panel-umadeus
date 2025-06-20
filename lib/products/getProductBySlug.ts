import createPocketBase from '@/lib/pocketbase'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { Produto } from '@/types'

export async function getProductBySlug(slug: string): Promise<Produto | null> {
  const pb = createPocketBase()
  const tenantId = await getTenantFromHost()
  try {
    const prod = await pb
      .collection('produtos')
      .getFirstListItem<Produto>(`slug='${slug}' && cliente='${tenantId}'`)
    const imagens = Array.isArray(prod.imagens)
      ? (prod.imagens || []).map((img) => pb.files.getURL(prod, img))
      : Object.fromEntries(
          Object.entries((prod.imagens ?? {}) as Record<string, string[]>)
            .map(([g, arr]) => [g, arr.map((img) => pb.files.getURL(prod, img))])
        )
    return { ...prod, imagens }
  } catch {
    return null
  }
}
