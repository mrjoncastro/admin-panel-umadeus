// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import { getAuthHeaders } from '@/lib/authHeaders'
import { pbRetry } from '@/lib/pbRetry'

export interface PostClientRecord {
  id: string
  title: string
  slug: string
  summary?: string
  date: string
  thumbnail?: string | null
  category?: string | null
  keywords?: string[]
  content?: string
  credit?: string | null
}

export async function getPostsClientPB(): Promise<PostClientRecord[]> {
  // const pb = createPocketBase() // [REMOVED]
  const headers = getAuthHeaders(pb)
  const res = await fetch('/api/tenant', { headers, credentials: 'include' })
  const data = (await res.json()) as { tenantId: string | null }
  const tenantId = data.tenantId

  const list = await pbRetry(() =>
    // pb. // [REMOVED] collection('posts').getFullList<PostClientRecord>({
      sort: '-date',
      filter: tenantId ? `cliente='${tenantId}'` : '',
    }),
  )

  return list.map((p) => ({
    ...p,
    thumbnail: p.thumbnail ? // pb. // [REMOVED] files.getUrl(p, p.thumbnail) : null,
  }))
}
