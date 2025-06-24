'use client'

import Link from 'next/link'
import Image from 'next/image'
import { isExternalUrl } from '@/utils/isExternalUrl'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  getPostsClientPB,
  type PostClientRecord,
} from '@/lib/posts/getPostsClientPB'

type Post = PostClientRecord

export default function BlogSidebar() {
  const [popular, setPopular] = useState<Post[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const searchParams = useSearchParams()!
  const current = searchParams.get('categoria')?.toLowerCase()

  useEffect(() => {
    getPostsClientPB().then((posts: Post[]) => {
      setPopular(posts.slice(0, 3))
      const unique = [...new Set(posts.map((p) => p.category).filter(Boolean))]
      setCategories(unique as string[])
    })
  }, [setPopular, setCategories])

  return (
    <aside className="w-full lg:w-1/3 mt-16 lg:mt-0 lg:pl-10 space-y-12">
      {/* Newsletter */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
        <input
          type="email"
          placeholder="Seu e-mail"
          className="w-full px-4 py-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
          Inscrever-se
        </button>
      </div>

      {/* Categorias */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Categorias</h3>
        <ul className="space-y-2 text-sm text-neutral-700">
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                href={`?categoria=${encodeURIComponent(cat.toLowerCase())}`}
                scroll={false}
                className={`hover:underline ${
                  current === cat.toLowerCase()
                    ? 'font-bold text-primary-600'
                    : ''
                }`}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
        {current && (
          <button
            onClick={() => window.history.pushState({}, '', '/blog')}
            className="mt-4 text-sm text-neutral-500 hover:underline"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Populares */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Artigos Populares</h3>
        <ul className="space-y-4">
          {popular.map((post) => (
            <li key={post.slug} className="flex items-center gap-3">
              {post.thumbnail &&
                (isExternalUrl(post.thumbnail) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ) : (
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ))}
              <Link
                href={`/blog/post/${post.slug}`}
                className="text-sm text-neutral-800 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
