// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import type { PostRecord } from './getPostsFromPB'

export async function getPostBySlug(slug: string): Promise<PostRecord | null> {
  // const pb = createPocketBase() // [REMOVED]
  const tenantId = await getTenantFromHost()
  try {
    const post = await pb
      .collection('posts')
      .getFirstListItem<PostRecord>(`slug='${slug}' && cliente='${tenantId}'`)
    return {
      ...post,
      thumbnail: post.thumbnail ? // pb. // [REMOVED] files.getUrl(post, post.thumbnail) : null,
    }
  } catch {
    return null
  }
}
