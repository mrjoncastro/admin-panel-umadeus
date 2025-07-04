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
      className="relative h-[600px] md:h-screen bg-cover bg-center text-white font-sans"
      style={{ backgroundImage: `url('${post.thumbnail}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Desktop */}
      <div className="hidden md:flex relative z-10 items-end justify-between max-w-7xl mx-auto w-full h-full px-10 pb-24">
        <div className="w-1/2" />
        <div className="w-full max-w-md bg-[var(--background)] dark:bg-neutral-900 text-[var(--text-primary)] p-8 rounded-2xl shadow-2xl">
          {post.category && (
            <span className="text-xs uppercase text-neutral-500 font-semibold tracking-wide">
              {post.category}
            </span>
          )}
          <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            {post.title}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">{post.summary}</p>
          <Link
            href={`/blog/post/${post.slug}`}
            className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
          >
            Leia mais →
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden relative z-10 h-full flex flex-col justify-end items-center px-4 pb-6">
        <div className="bg-[var(--background)] dark:bg-neutral-900 text-[var(--text-primary)] rounded-2xl shadow-xl p-5 w-full max-w-sm">
          {post.category && (
            <span className="text-xs uppercase text-neutral-500 font-semibold tracking-wide">
              {post.category}
            </span>
          )}
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {post.title}
          </h3>
          <p className="text-sm text-neutral-700 my-2">{post.summary}</p>
          <Link
            href={`/blog/post/${post.slug}`}
            className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
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
                index === currentIndex ? 'bg-primary-600' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navegação ← → apenas no desktop */}
      <div className="absolute bottom-5 left-5 z-20 gap-2 hidden md:flex">
        <button
          onClick={prevSlide}
          className="bg-[var(--background)] text-neutral-700 border rounded-md p-2 hover:bg-neutral-100 shadow"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="bg-[var(--background)] text-neutral-700 border rounded-md p-2 hover:bg-neutral-100 shadow"
        >
          →
        </button>
      </div>
    </section>
  )
}
