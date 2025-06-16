import type PocketBase from 'pocketbase'
import createPocketBase from '../pocketbase'

export interface PostRecord {
  title: string
  slug: string
  summary: string
  date: string
  thumbnail?: string | null
  category?: string | null
  keywords?: string[]
}

export async function listPosts(pb: PocketBase = createPocketBase()) {
  const records = await pb.collection('posts').getFullList<PostRecord>({ sort: '-date' })
  return records.map(r => ({
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    date: r.date,
    thumbnail: r.thumbnail ?? null,
    category: r.category ?? null,
    keywords: r.keywords ?? []
  }))
}

export async function getRecentPosts(pb?: PocketBase, limit = 3) {
  const posts = await listPosts(pb)
  return posts.slice(0, limit)
}
