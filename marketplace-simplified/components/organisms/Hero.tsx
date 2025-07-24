'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getPostsClientPB,
  type PostClientRecord,
} from '@/lib/posts/getPostsClientPB'

type Post = PostClientRecord

export default function BlogHeroCarousel() {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    getPostsClientPB().then((data) => setPosts(data.slice(0, 3)))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [posts])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }

  if (posts.length === 0) return null

  const post = posts[currentIndex]

  return (
    <section
      className="relative h-[260px] md:h-[420px] bg-cover bg-center text-white font-sans"
      style={{ backgroundImage: `url('${post.thumbnail}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sidebar fixa no desktop, flutuante com espaçamento */}
      <div className="hidden md:block absolute top-0 bottom-0 right-0 z-20 flex items-center">
        <div className="h-[340px] w-[340px] bg-white/90 text-neutral-800 p-8 rounded-l-2xl shadow-xl border-l-4 border-black_bean/15 flex flex-col justify-center space-y-3 mr-12">
          {post.category && (
            <span className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
              {post.category}
            </span>
          )}
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600 flex-1">{post.summary}</p>
          <Link
            href={`/blog/post/${post.slug}`}
            className="text-black_bean font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Leia mais →
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden relative z-10 h-full flex flex-col justify-end items-center px-4 pb-6">
        <div className="bg-white text-neutral-800 rounded-2xl shadow-xl p-5 w-full max-w-sm">
          {post.category && (
            <span className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
              {post.category}
            </span>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
          <p className="text-sm text-gray-700 my-2">{post.summary}</p>
          <Link
            href={`/blog/post/${post.slug}`}
            className="text-blue-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Leia mais →
          </Link>
        </div>
        {/* Dots */}
        <div className="mt-4 flex gap-2 justify-center">
          {posts.map((post, index) => (
            <span
              key={post.slug}
              className={`w-2.5 h-2.5 rounded-full ${
                index === currentIndex ? 'bg-blue-600' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navegação ← → apenas no desktop */}
      <div className="absolute bottom-5 left-5 z-20 gap-2 hidden md:flex">
        <button
          onClick={prevSlide}
          className="bg-white text-gray-700 border rounded-md p-2 hover:bg-gray-100 shadow"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="bg-white text-gray-700 border rounded-md p-2 hover:bg-gray-100 shadow"
        >
          →
        </button>
      </div>
    </section>
  )
}
