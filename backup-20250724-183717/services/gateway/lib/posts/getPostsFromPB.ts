// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { pbRetry } from '@/lib/pbRetry'

export interface PostRecord {
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

export async function getPostsFromPB() {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  const list = await pbRetry(() =>
    // pb. // [REMOVED] collection('posts').getFullList<PostRecord>({
      sort: '-date',
      filter: tenantId ? `cliente='${tenantId}'` : '',
    }),
  )

  return list.map((p) => ({
    ...p,
    thumbnail: p.thumbnail ? // pb. // [REMOVED] files.getUrl(p, p.thumbnail) : null,
  }))
}
