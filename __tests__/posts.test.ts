import { describe, it, expect, vi } from 'vitest'
import { getPosts } from '../lib/posts/getPosts'
import { getRelatedPosts } from '../lib/posts/getRelatedPosts'
import { getRecentPostsPB } from '../lib/posts/getRecentPostsPB'

describe('posts utilities', () => {
  it('getPosts retorna lista ordenada', async () => {
    const posts = await getPosts()
    expect(posts[0].slug).toBe('dores-gstricas')
    expect(posts.at(-1)?.slug).toBe('dicas-controlar-ansiedade')
  })

  it('getRelatedPosts fornece proximo post e sugestoes', () => {
    const { nextPost, suggestions } = getRelatedPosts('primeiro-post', 'Geral')
    expect(nextPost?.slug).toBe('segundo-post')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].slug).toBe('segundo-post')
  })

  it('getRecentPostsPB busca via PocketBase e limita a 3', async () => {
    const items = [{}, {}, {}, {}]
    const getList = vi.fn().mockResolvedValue({ items })
    const pbMock = { collection: vi.fn(() => ({ getList })) }
    const recent = await getRecentPostsPB(3, pbMock as any)
    expect(pbMock.collection).toHaveBeenCalledWith('posts')
    expect(getList).toHaveBeenCalledWith(1, 3, { sort: '-date' })
    expect(recent).toEqual(items)
  })
})
