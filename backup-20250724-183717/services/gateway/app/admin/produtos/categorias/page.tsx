import { logger } from '@/lib/logger'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import ModalCategoria from './ModalCategoria'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

interface Categoria {
  id: string
  nome: string
  slug: string
}

export default function CategoriasAdminPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const { authChecked } = useAuthGuard(['coordenador'])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return
    fetch('/admin/api/categorias')
      .then((res) => res.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        logger.error('Erro ao carregar categorias:', err)
        setCategorias([])
      })
  }, [isLoggedIn, ctxUser?.role, authChecked])

  async function handleSave(form: { nome: string }) {
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return
    const metodo = editCategoria ? 'PUT' : 'POST'
    const url = editCategoria
      ? `/admin/api/categorias/${editCategoria.id}`
      : '/admin/api/categorias'
    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccess(editCategoria ? 'Categoria atualizada' : 'Categoria criada')
        fetch('/admin/api/categorias')
          .then((r) => r.json())
          .then((cats) => setCategorias(Array.isArray(cats) ? cats : []))
          .catch((err) => {
            logger.error('Erro ao atualizar categorias:', err)
            setCategorias([])
          })
      } else {
        showError('Erro: ' + data.error)
      }
    } catch (err) {
      logger.error('Erro ao salvar categoria:', err)
      showError('Erro ao salvar categoria')
    } finally {
      setModalOpen(false)
      setEditCategoria(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirma excluir?')) return
    try {
      const res = await fetch(`/admin/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {},
      })
      if (!res.ok) {
        const data = await res.json()
        showError('Erro: ' + (data.error || 'Não foi possível excluir.'))
        return
      }
      setCategorias((prev) => prev.filter((c) => c.id !== id))
      showSuccess('Categoria excluída')
    } catch (err) {
      logger.error('Erro ao excluir categoria:', err)
      showError('Erro ao excluir categoria')
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
          Categorias
        </h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nova Categoria
        </button>
      </div>
      {modalOpen && (
        <ModalCategoria
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditCategoria(null)
          }}
          onSubmit={handleSave}
          initial={editCategoria ? { nome: editCategoria.nome } : null}
        />
      )}
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.slug}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditCategoria(c)
                        setModalOpen(true)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => handleDelete(c.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
