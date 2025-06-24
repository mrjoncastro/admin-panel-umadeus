'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const BlogSidebar = dynamic(
  () => import('@/components/organisms/BlogSidebar'),
  {
    ssr: false,
  },
)
const BlogHeroCarousel = dynamic(
  () => import('@/components/organisms/BlogHeroCarousel'),
  { ssr: false },
)
const BlogPostsList = dynamic(
  () => import('@/components/organisms/BlogPostsList'),
)
import type { Cliente } from '@/types'
import {
  getPostsClientPB,
  type PostClientRecord,
} from '@/lib/posts/getPostsClientPB'

type Post = PostClientRecord

const POSTS_PER_PAGE = 6

export default function BlogClient() {
  const [nomeCliente, setNomeCliente] = useState('')

  useEffect(() => {
    async function fetchCliente() {
      try {
        const res = await fetch('/api/tenant-config', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = (await res.json()) as Cliente
          setNomeCliente(data?.nome ?? '')
        } else {
          setNomeCliente('')
        }
      } catch (err) {
        console.error('Erro ao buscar nome do cliente:', err)
      }
    }
    fetchCliente()
  }, [])

  const introText = {
    title: 'Criamos este espaço porque acreditamos no poder do conhecimento.',
    paragraph: `${nomeCliente} valoriza a informação como forma de cuidado. Por isso, cada conteúdo aqui foi pensado para orientar, inspirar e caminhar ao seu lado.`,
  }

  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const searchParams = useSearchParams()!
  const categoriaSelecionada =
    searchParams.get('categoria')?.toLowerCase() || ''

  useEffect(() => {
    getPostsClientPB()
      .then(setPosts)
      .catch((err) => {
        console.error('Erro ao carregar posts:', err)
      })
  }, [])

  const filteredPosts = posts.filter((post) => {
    const texto = `${post.title} ${post.summary} ${post.category}`.toLowerCase()
    const correspondeBusca = texto.includes(search.toLowerCase())
    const correspondeCategoria = categoriaSelecionada
      ? post.category?.toLowerCase() === categoriaSelecionada
      : true
    return correspondeBusca && correspondeCategoria
  })

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <BlogHeroCarousel />

      <main className="max-w-7xl mx-auto px-6 py-20 font-sans">
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {introText.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg mb-6">
            {introText.paragraph}
          </p>
          <div className="max-w-xl mx-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por assunto ou dúvida..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            {paginatedPosts.length > 0 ? (
              <>
                <BlogPostsList posts={paginatedPosts} />

                <div className="flex justify-center items-center mt-12 gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={`page-${i + 1}`}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 text-sm rounded ${
                        currentPage === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50"
                  >
                    Próxima →
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-neutral-500 text-lg">
                Nenhum post encontrado com esse termo.
              </p>
            )}
          </div>

          <BlogSidebar />
        </div>
      </main>
    </>
  )
}
