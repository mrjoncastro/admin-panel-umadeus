'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import Link from 'next/link'
import type { Produto } from '@/types'
import { ModalProduto } from './novo/ModalProduto'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-+/g, '-')
}

const PRODUTOS_POR_PAGINA = 10

export default function AdminProdutosPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { authChecked } = useAuthGuard(['coordenador'])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const pathname = usePathname()!

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return

    async function fetchProdutos() {
      try {
        const res = await fetch('/admin/api/produtos')
        const data = await res.json()
        setProdutos(Array.isArray(data) ? data : (data.items ?? []))
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
      }
    }
    fetchProdutos()
  }, [isLoggedIn, ctxUser?.role, authChecked])

  const totalPages = Math.ceil(produtos.length / PRODUTOS_POR_PAGINA)
  const paginated = produtos.slice(
    (page - 1) * PRODUTOS_POR_PAGINA,
    page * PRODUTOS_POR_PAGINA,
  )

  // Função para adicionar produto na lista após cadastro via modal
  const handleNovoProduto = async (form: Produto) => {
    const formData = new FormData()
    formData.set('nome', String(form.nome ?? ''))
    formData.set('preco', String(form.preco ?? 0))
    if (form.checkout_url)
      formData.set('checkout_url', String(form.checkout_url))
    if (form.categoria) formData.set('categoria', String(form.categoria))
    if (Array.isArray(form.tamanhos)) {
      form.tamanhos.forEach((t) => formData.append('tamanhos', t))
    }
    if (Array.isArray(form.generos)) {
      form.generos.forEach((g) => formData.append('generos', g))
    }
    if (form.descricao) formData.set('descricao', String(form.descricao))
    if (form.detalhes) formData.set('detalhes', String(form.detalhes))
    if (!form.slug && form.nome) {
      form.slug = slugify(String(form.nome))
    }
    if (form.slug) formData.set('slug', String(form.slug))
    if (Array.isArray(form.cores)) {
      formData.set('cores', (form.cores as string[]).join(','))
    } else if (form.cores) {
      formData.set('cores', String(form.cores))
    }
    if (form.evento_id) formData.set('evento_id', String(form.evento_id))
    formData.set(
      'requer_inscricao_aprovada',
      String(form.requer_inscricao_aprovada ? 'true' : 'false'),
    )
    formData.set('ativo', String(form.ativo ? 'true' : 'false'))
    if (form.imagens && form.imagens instanceof FileList) {
      Array.from(form.imagens).forEach((file) =>
        formData.append('imagens', file),
      )
    }

    try {
      const res = await fetch('/admin/api/produtos', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Falha ao criar produto', res.status, data)
        showError('Erro ao criar produto')
        return
      }
      const data = await res.json()
      setProdutos((prev) => [data, ...prev])
      showSuccess('Produto criado')
    } catch (err) {
      console.error('Erro ao criar produto:', err)
      showError('Erro ao criar produto')
    }

    setModalOpen(false)
    setPage(1)
  }

  async function handleExcluirProduto(id: string) {
    if (!confirm('Confirma excluir?')) return
    try {
      const res = await fetch(`/admin/api/produtos/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        showError('Erro: ' + (data.error || 'Não foi possível excluir.'))
        return
      }
      setProdutos((prev) => prev.filter((p) => p.id !== id))
      showSuccess('Produto excluído')
    } catch (err) {
      console.error('Erro ao excluir produto:', err)
      showError('Erro ao excluir produto')
    }
  }

  if (!authChecked) return null

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Produtos
        </h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Novo Produto
        </button>
      </div>

      <nav className="mb-6 border-b border-neutral-200 dark:border-neutral-700 flex gap-4">
        <Link
          href="/admin/produtos"
          className={`pb-2 ${
            pathname === '/admin/produtos'
              ? 'border-b-2 border-[var(--accent)]'
              : 'hover:text-[var(--accent)]'
          }`}
        >
          Produtos
        </Link>
        <Link
          href="/admin/produtos/categorias"
          className={`pb-2 ${
            pathname === '/admin/produtos/categorias'
              ? 'border-b-2 border-[var(--accent)]'
              : 'hover:text-[var(--accent)]'
          }`}
        >
          Categorias
        </Link>
      </nav>

      {/* O modal fica aqui, fora do cabeçalho. Só é aberto se modalOpen=true */}
      {modalOpen && (
        <ModalProduto<Produto>
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleNovoProduto}
        />
      )}

      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-neutral-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              paginated.map((produto) => (
                <tr key={produto.id}>
                  <td className="font-medium">{produto.nome}</td>
                  <td>
                    {Number(produto.preco).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td>
                    {produto.ativo ? (
                      <span className="text-green-600 font-semibold">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/produtos/editar/${produto.id}`}
                        className="btn"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn"
                        style={{ color: 'var(--accent)' }}
                        onClick={() => handleExcluirProduto(produto.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-[var(--space-md)] mt-[var(--space-lg)]">
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  )
}
