'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import PostContentEditor from '../components/PostContentEditor'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function NovoPostPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { authChecked } = useAuthGuard(['coordenador'])
  const [conteudo, setConteudo] = useState('')
  const [preview, setPreview] = useState(false)
  const [thumbnail, setThumbnail] = useState('')
  const [keywords, setKeywords] = useState('')

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoggedIn, router, authChecked])

  if (!authChecked) return null

  if (preview) {
    return (
      <main className="max-w-[680px] mx-auto px-4 py-8 bg-white">
        <button
          onClick={() => setPreview(false)}
          className="mb-4 rounded bg-neutral-200 px-3 py-2"
        >
          Editar
        </button>
        <article
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: conteudo }}
        />
      </main>
    )
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Novo Post</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          formData.set('content', conteudo)
          // Adiciona data atual no formato ISO (salva sempre a data/hora do envio)
          formData.set('date', new Date().toISOString())
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
          className="w-full border p-2 rounded"
        />
        {/* Campo de data APENAS visualização, não enviado */}
        <input
          type="text"
          value={new Date().toLocaleDateString('pt-BR')}
          readOnly
          disabled
          className="input-base"
        />
        <input
          type="text"
          placeholder="Categoria"
          name="category"
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
  )
}
