import { notFound } from 'next/navigation'
import Footer from '@/components/templates/Footer'
import Image from 'next/image'
import { Share2, Clock } from 'lucide-react'
import { isExternalUrl } from '@/utils/isExternalUrl'
import { getTenantFromHost } from '@/lib/getTenantFromHost'
import { getTenantHost } from '@/lib/getTenantHost'
import type { Metadata } from 'next'
import { getRelatedPostsFromPB } from '@/lib/posts/getRelatedPostsFromPB'
import { getPostBySlug } from '@/lib/posts/getPostBySlug'
import NextPostButton from './NextPostButton.dynamic'
import PostSuggestions from './PostSuggestions.dynamic'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

interface Params {
  slug: string
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post não encontrado',
      description: 'O conteúdo solicitado não foi encontrado.',
    }
  }

  return {
    title: post.title,
    description: post.summary || '',
    openGraph: {
      title: post.title,
      description: post.summary || '',
      images: [post.thumbnail || '/img/og-default.jpg'],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params

  const post = await getPostBySlug(slug)
  if (!post) return notFound()

  const { nextPost, suggestions } = await getRelatedPostsFromPB(
    slug,
    post.category || '',
  )
  const safeSuggestions = suggestions.map((s) => ({
    ...s,
    summary: s.summary || '',
    thumbnail: s.thumbnail || '',
    category: s.category || '',
  }))
  const mdxContent = post.content || ''

  const words = mdxContent.split(/\s+/).length
  const readingTime = Math.ceil(words / 200)

  const tenantId = await getTenantFromHost()
  const host = tenantId ? await getTenantHost(tenantId) : null
  const siteUrl = host || 'https://m24saude.com.br'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || '',
    image: isExternalUrl(post.thumbnail || '')
      ? post.thumbnail
      : `${siteUrl}${post.thumbnail || '/img/og-default.jpg'}`,
    author: {
      '@type': 'Person',
      name: 'Redação M24',
    },
    publisher: {
      '@type': 'Organization',
      name: 'M24 Saúde',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/img/M24.webp`,
      },
    },
    datePublished: post.date || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/post/${slug}`,
    },
  }

  return (
    <>
      <main className="mx-auto mt-8 max-w-[680px] px-5 py-20 text-[1.125rem] leading-[1.8] text-[var(--text-primary)] bg-white">
        {post.thumbnail && (
          <figure>
            {isExternalUrl(post.thumbnail) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.thumbnail}
                alt={`Imagem de capa: ${post.title}`}
                className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
              />
            ) : (
              <Image
                src={post.thumbnail}
                alt={`Imagem de capa: ${post.title}`}
                width={1200}
                height={600}
                className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
              />
            )}
            {post.credit && (
              <figcaption className="text-sm text-neutral-500 text-center mt-2 italic">
                {post.credit}
              </figcaption>
            )}
          </figure>
        )}

        {post.category && (
          <span className="text-xs uppercase text-primary-600 font-semibold">
            {post.category}
          </span>
        )}

        <h1 className="text-2xl md:text-3xl font-bold leading-snug mt-2 mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-[0.9375rem] mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src="/img/avatar_m24.webp"
              alt="Autor"
              width={40}
              height={40}
              className="flex-shrink-0 w-9 h-9 rounded-full object-cover"
            />
            <span>Redação M24</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min de leitura</span>
          </div>

          <a
            href={`https://twitter.com/intent/tweet?url=${siteUrl}/blog/post/${slug}&text=${encodeURIComponent(
              post.title,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary-600 hover:underline"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </a>
        </div>

        {post.summary && (
          <p className="mb-8 text-[1.125rem] text-neutral-700">
            {post.summary}
          </p>
        )}

        <article
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: mdxContent }}
        />
        {nextPost && <NextPostButton slug={nextPost.slug} />}
      </main>

      <PostSuggestions posts={safeSuggestions} />
      <Footer />

      {/* JSON-LD Schema para SEO */}
      <Script
        id="blogpost-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  )
}
