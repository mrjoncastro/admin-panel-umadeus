import { describe, it, expect, vi } from 'vitest'
import type PocketBase from 'pocketbase'
import { listPosts, getRecentPosts } from '../lib/posts/getPostsPocketBase'
import { getRelatedPosts } from '../lib/posts/getRelatedPosts'

function createMockPb(data: any[]) {
  return {
    collection: vi.fn(() => ({
      getFullList: vi.fn().mockResolvedValue(data)
    }))
  } as unknown as PocketBase
}

describe('posts utilities with PocketBase', () => {
  it('listPosts consulta colecao e mapeia campos', async () => {
    const items = [
      { title: 'B', slug: 'b', summary: '', date: '2024-01-02' },
      { title: 'A', slug: 'a', summary: '', date: '2024-02-01' }
    ]
    const pb = createMockPb(items)
    const posts = await listPosts(pb)
    expect(pb.collection).toHaveBeenCalledWith('posts')
    expect(posts[0].slug).toBe('b')
    expect(posts[1].slug).toBe('a')
  })

  it('getRecentPosts limita a 3', async () => {
    const data = Array.from({ length: 5 }, (_, i) => ({ title: `p${i}`, slug: `p${i}`, summary: '', date: `2024-0${i+1}-01` }))
    const pb = createMockPb(data)
    const recent = await getRecentPosts(pb)
    expect(recent).toHaveLength(3)
  })

  it('getRelatedPosts fornece proximo post', () => {
    const { nextPost } = getRelatedPosts('primeiro-post', 'Geral')
    expect(nextPost?.slug).toBe('segundo-post')
  })
})
