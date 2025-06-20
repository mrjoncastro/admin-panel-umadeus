'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import PostContentEditor from '../../components/PostContentEditor'
import Header from '@/components/templates/Header'
import Footer from '@/components/templates/Footer'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { isExternalUrl } from '@/utils/isExternalUrl'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function EditarPostPage() {
  const { slug } = useParams<{ slug: string }>()

  const [conteudo, setConteudo] = useState('')
  const [preview, setPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [keywords, setKeywords] = useState('')

  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { user, pb, authChecked } = useAuthGuard(['coordenador'])

  if (!authChecked) return null

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace('/login')
    }
  }, [isLoggedIn, user, router])

  useEffect(() => {
    fetch(`/admin/api/posts/${slug}`)
      .then((res) => res.json())
      .then(
        (data: {
          title: string
          summary: string
          category: string
          content: string
          date: string
          thumbnail: string
          keywords: string
        }) => {
          setTitle(data.title)
          setSummary(data.summary)
          setCategory(data.category)
          setConteudo(data.content)
          setDate(data.date)
          setThumbnail(data.thumbnail)
          setKeywords(data.keywords)
        },
      )
      .catch((err) => console.error('Erro ao carregar post:', err))
  }, [slug])

  if (preview) {
    const words = conteudo.split(/\s+/).length
    const readingTime = Math.ceil(words / 200)

    return (
      <>
        <Header />
        <main className="mx-auto mt-8 max-w-[680px] px-5 py-20 text-[1.125rem] leading-[1.8] text-[var(--text-primary)] bg-white">
          <button
            onClick={() => setPreview(false)}
            className="mb-6 rounded bg-neutral-200 px-3 py-2"
          >
            Editar
          </button>

          {thumbnail && (
            <figure>
              {isExternalUrl(thumbnail) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={`Imagem de capa: ${title}`}
                  className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
                />
              ) : (
                <Image
                  src={thumbnail}
                  alt={`Imagem de capa: ${title}`}
                  width={1200}
                  height={600}
                  className="w-full max-w-[640px] max-h-[360px] object-cover rounded-xl mx-auto mb-6"
                />
              )}
            </figure>
          )}

          {category && (
            <span className="text-xs uppercase text-primary-600 font-semibold">
              {category}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-bold leading-snug mt-2 mb-6">
            {title}
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
          </div>

          {keywords && (
            <p className="mb-2 text-sm text-neutral-500">
              Palavras-chave: {keywords}
            </p>
          )}

          {date && <p className="text-sm text-neutral-500 mb-6">{date}</p>}

          {summary && (
            <p className="mb-8 text-[1.125rem] text-neutral-700">{summary}</p>
          )}

          <article
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: conteudo }}
          />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Editar Post</h1>
        <p className="text-sm text-gray-600 mb-4">Slug: {slug}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            formData.set('content', conteudo)
            fetch('/admin/api/posts', {
              method: 'POST',
              body: formData,
            })
              .then((res) => res.json())
              .then(() => router.push('/admin/posts'))
              .catch((err) => console.error('Erro ao salvar post:', err))
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Título"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="date"
            name="date"
            value={date}
            className="w-full border p-2 rounded bg-neutral-100 cursor-not-allowed opacity-80"
            disabled
          />

          <input
            type="text"
            placeholder="Categoria"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Thumbnail (URL)"
            name="thumbnail"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Palavras-chave"
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <PostContentEditor value={conteudo} onChange={setConteudo} />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex-1 bg-neutral-200 py-2 rounded"
            >
              Pré-visualizar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 rounded"
            >
              Salvar
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
