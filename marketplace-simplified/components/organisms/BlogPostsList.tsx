'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Post {
  slug: string
  title: string
  summary?: string
  thumbnail?: string | null
  date?: string
  category?: string | null
}

interface BlogPostsListProps {
  posts: Post[]
}

export default function BlogPostsList({ posts }: BlogPostsListProps) {
  if (!posts.length) {
    return (
      <p className="text-center text-neutral-500 text-lg">
        Nenhum post encontrado com esse termo.
      </p>
    )
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {posts.map((post) => (
        <div
          key={post.slug}
          className="bg-[var(--background)] dark:bg-neutral-900 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
        >
          {post.thumbnail && (
            <Image
              src={post.thumbnail}
              alt={`Imagem de capa do post: ${post.title}`}
              width={640}
              height={320}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6 flex-1 flex flex-col justify-between">
            {post.category && (
              <span className="inline-block bg-primary-50 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                {post.category}
              </span>
            )}
            <Link href={`/blog/post/${post.slug}`} className="hover:underline">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-neutral-500 mb-3">{post.date}</p>
            <p className="text-sm text-neutral-700 mb-4 line-clamp-3">
              {post.summary}
            </p>
            <Link
              href={`/blog/post/${post.slug}`}
              className="mt-auto inline-block text-sm text-primary-600 hover:text-primary-800 font-semibold"
            >
              Leia mais →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
