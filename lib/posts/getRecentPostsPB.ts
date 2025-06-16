import createPocketBase from '@/lib/pocketbase'
import type { RecordModel } from 'pocketbase'

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
  pb = createPocketBase()
): Promise<BlogPostRecord[]> {
  const list = await pb
    .collection('posts')
    .getList(1, limit, { sort: '-date' })
  return list.items as BlogPostRecord[]
}
