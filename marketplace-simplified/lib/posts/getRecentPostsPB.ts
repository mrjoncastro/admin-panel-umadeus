// [MIGRATION NOTE] This file needs to be updated to use Supabase instead of PocketBase
// TODO: Replace PocketBase functionality with Supabase equivalents

// [REMOVED] PocketBase import
// [REMOVED] PocketBase import
import { pbRetry } from '@/lib/pbRetry'

export interface BlogPostRecord extends RecordModel {
  title: string
  slug: string
  summary?: string
  date?: string
  thumbnail?: string
  category?: string
  keywords?: string[]
}

export async function getRecentPostsPB(
  limit = 3,
  pb = createPocketBase(),
): Promise<BlogPostRecord[]> {
  const list = await pbRetry(() =>
    // pb. // [REMOVED] collection('posts').getList(1, limit, { sort: '-date' }),
  )
  return list.items as BlogPostRecord[]
}
