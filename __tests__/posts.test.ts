import { describe, it, expect, vi } from 'vitest'
import { getPosts } from '../lib/posts/getPosts'
import { getRelatedPosts } from '../lib/posts/getRelatedPosts'
import { getRecentPostsClient } from '../lib/posts/getRecentPostsClient'

describe('posts utilities', () => {
  it('getPosts retorna lista ordenada', async () => {
    const posts = await getPosts()
    expect(posts[0].slug).toBe('segundo-post')
    expect(posts.at(-1)?.slug).toBe('dicas-controlar-ansiedade')
  })

  it('getRelatedPosts fornece proximo post e sugestoes', () => {
    const { nextPost, suggestions } = getRelatedPosts('primeiro-post', 'Geral')
    expect(nextPost?.slug).toBe('segundo-post')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0].slug).toBe('segundo-post')
  })

  it('getRecentPostsClient busca e limita a 3 posts', async () => {
    const mockData = [{}, {}, {}, {}]
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) })
    // @ts-ignore
    global.fetch = fetchMock
    const recent = await getRecentPostsClient()
    expect(fetchMock).toHaveBeenCalledWith('/posts.json', { cache: 'no-store' })
    expect(recent).toHaveLength(3)
  })
})
