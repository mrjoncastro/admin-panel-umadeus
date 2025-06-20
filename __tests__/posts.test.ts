import { describe, it, expect, vi } from 'vitest'
import type PocketBase from 'pocketbase'
import { listPosts, getRecentPosts } from '../lib/posts/getPostsPocketBase'
import { getRelatedPosts } from '../lib/posts/getRelatedPosts'
import { getRecentPostsPB } from '../lib/posts/getRecentPostsPB'

function createMockPb(data: any[]) {
  return {
    collection: vi.fn(() => ({
      getFullList: vi.fn().mockResolvedValue(data),
    })),
  } as unknown as PocketBase
}

describe('posts utilities with PocketBase', () => {
  it('listPosts consulta colecao e mapeia campos', async () => {
    const items = [
      { title: 'B', slug: 'b', summary: '', date: '2024-01-02' },
      { title: 'A', slug: 'a', summary: '', date: '2024-02-01' },
    ]
    const pb = createMockPb(items)
    const posts = await listPosts(pb)
    expect(pb.collection).toHaveBeenCalledWith('posts')
    expect(posts[0].slug).toBe('b')
    expect(posts[1].slug).toBe('a')
  })

  it('getRecentPostsPB busca via PocketBase e limita a 3', async () => {
    const items = [{}, {}, {}, {}]
    const getList = vi.fn().mockResolvedValue({ items })
    const pbMock = { collection: vi.fn(() => ({ getList })) }
    const recent = await getRecentPostsPB(3, pbMock as any)
    expect(pbMock.collection).toHaveBeenCalledWith('posts')
    expect(getList).toHaveBeenCalledWith(1, 3, { sort: '-date' })
    expect(recent).toEqual(items)
    it('getRecentPosts limita a 3', async () => {
      const data = Array.from({ length: 5 }, (_, i) => ({
        title: `p${i}`,
        slug: `p${i}`,
        summary: '',
        date: `2024-0${i + 1}-01`,
      }))
      const pb = createMockPb(data)
      const recent = await getRecentPosts(pb)
      expect(recent).toHaveLength(3)
    })

    it('getRelatedPosts fornece proximo post', () => {
      const { nextPost } = getRelatedPosts('primeiro-post', 'Geral')
      expect(nextPost?.slug).toBe('segundo-post')
    })
  })
})
