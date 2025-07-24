import { getPostsFromPB, PostRecord } from './getPostsFromPB'

export interface RelatedResult {
  nextPost: PostRecord | null
  suggestions: PostRecord[]
}

export async function getRelatedPostsFromPB(
  currentSlug: string,
  currentCategory: string,
): Promise<RelatedResult> {
  const posts = await getPostsFromPB()

  let filtered = posts.filter((p) => p.category === currentCategory)
  if (filtered.length < 2) filtered = posts

  const sorted = filtered.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const currentIndex = sorted.findIndex((p) => p.slug === currentSlug)
  const nextPost = sorted[currentIndex + 1] || null
  const suggestions = sorted.filter((p) => p.slug !== currentSlug).slice(0, 3)

  return { nextPost, suggestions }
}
