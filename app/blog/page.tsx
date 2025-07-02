import { Suspense } from 'react'
import BlogClient from './BlogClient.dynamic'
import LoadingOverlay from '@/components/organisms/LoadingOverlay'
import type { Metadata } from 'next'
import { getPostsFromPB } from '@/lib/posts/getPostsFromPB'
import { isExternalUrl } from '@/utils/isExternalUrl'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getTenantHost } from '@/lib/getTenantHost'

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPostsFromPB()
  if (!posts.length) {
    return {
      title: 'Blog',
      description: 'Artigos e notícias',
    }
  }
  const first = posts[0]
  const tenantId = await getTenantFromHost()
  const host = tenantId ? await getTenantHost(tenantId) : null
  const siteUrl = host || 'https://m24saude.com.br'
  const image = first.thumbnail
    ? isExternalUrl(first.thumbnail)
      ? first.thumbnail
      : `${siteUrl}${first.thumbnail}`
    : '/img/og-default.jpg'
  const title = `Blog - ${first.title}`
  const description = first.summary || ''
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
  }
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={<LoadingOverlay show={true} text="Carregando posts..." />}
    >
      <BlogClient />
    </Suspense>
  )
}
