'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { Produto } from '@/types'
import { ModalProduto } from '../../produtos/novo/ModalProduto'
import { useToast } from '@/lib/context/ToastContext'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function NovoEventoPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const { authChecked } = useAuthGuard(['coordenador'])

  const [cobraInscricao, setCobraInscricao] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([])
  const [produtoModalOpen, setProdutoModalOpen] = useState(false)

  function toggleProduto(id: string) {
    setSelectedProdutos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') {
      router.replace('/login')
    }
  }, [isLoggedIn, router, ctxUser?.role, authChecked])

  useEffect(() => {
    if (!authChecked) return
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return
    fetch('/admin/api/produtos')
      .then((r) => r.json())
      .then((data) => {
        setProdutos(Array.isArray(data) ? data : (data.items ?? []))
      })
      .catch(() => setProdutos([]))
  }, [isLoggedIn, ctxUser?.role, authChecked])

  async function handleNovoProduto(form: Produto) {
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
    if (Array.isArray(form.cores)) {
      formData.set('cores', (form.cores as string[]).join(','))
    } else if (form.cores) {
      formData.set('cores', String(form.cores))
    }
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
      if (!res.ok) return
      const data = await res.json()
      setProdutos((prev) => [data, ...prev])
      setSelectedProdutos((prev) => [...prev, data.id])
    } catch (err) {
      console.error('Erro ao criar produto:', err)
    } finally {
      setProdutoModalOpen(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formElement = e.currentTarget as HTMLFormElement
    const formData = new FormData(formElement)
    const logoInput = formElement.querySelector<HTMLInputElement>(
      "input[name='logo']",
    )
    const files = logoInput?.files
    formData.delete('logo')
    if (files && files.length > 0) {
      formData.append('logo', files[0])
    }
    formData.delete('produtos')
    selectedProdutos.forEach((p) => formData.append('produtos', p))
    formData.set('cobra_inscricao', String(cobraInscricao))
    try {
      const res = await fetch('/admin/api/eventos', {
        method: 'POST',
        body: formData,
        headers: {},
      })
      if (res.ok) {
        showSuccess('Evento salvo com sucesso')
        router.push('/admin/eventos')
      } else {
        showError('Falha ao salvar evento')
      }
    } catch (err) {
      console.error('Erro ao salvar evento:', err)
      showError('Falha ao salvar evento')
    }
  }

  if (!authChecked) return null

  return (
    <>
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Novo Evento
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input-base"
            name="titulo"
            placeholder="Título"
            maxLength={30}
            required
          />
          <textarea
            className="input-base"
            name="descricao"
            rows={2}
            maxLength={150}
            required
          />
          <input className="input-base" name="data" type="date" required />
          <input className="input-base" name="cidade" required />
          <input
            type="file"
            name="logo"
            accept="image/*"
            className="input-base"
          />
          <select
            name="status"
            defaultValue="em breve"
            className="input-base"
            required
          >
            <option value="em breve">Em breve</option>
            <option value="realizado">Realizado</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="cobra_inscricao"
              id="cobra_inscricao"
              className="checkbox-base"
              checked={cobraInscricao}
              onChange={(e) => setCobraInscricao(e.target.checked)}
            />
            <label htmlFor="cobra_inscricao" className="text-sm font-medium">
              Realizar cobrança?
            </label>
          </div>
          {cobraInscricao && (
            <div className="mb-2">
              <label className="block text-base font-bold text-gray-800 mb-2">
                Produtos para inscrição
              </label>
              <div className="flex flex-col gap-3">
                {produtos.length === 0 ? (
                  <span className="text-sm text-gray-500 italic px-2">
                    Nenhum produto cadastrado ainda.
                  </span>
                ) : (
                  produtos.map((p) => (
                    <label
                      key={p.id}
                      className={`
              flex items-center gap-3 p-4 rounded-xl shadow-sm transition-all
              border-2 bg-white cursor-pointer select-none
              ${
                selectedProdutos.includes(p.id)
                  ? 'border-primary bg-primary ring-2 ring-primary'
                  : 'border-gray-200 hover:border-primary'
              }
            `}
                    >
                      <input
                        type="checkbox"
                        name="produtos"
                        value={p.id}
                        checked={selectedProdutos.includes(p.id)}
                        onChange={() => toggleProduto(p.id)}
                        className="w-5 h-5 accent-purple-600 rounded-lg transition shadow focus:ring-2 focus:ring-purple-300"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-base">
                          {p.nome}
                        </span>
                        {p.preco !== undefined && (
                          <span className="text-xs text-gray-500">
                            R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </label>
                  ))
                )}
                <button
                  type="button"
                  className="btn btn-secondary w-fit"
                  onClick={() => setProdutoModalOpen(true)}
                >
                  <span>+ Produto</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Salvar
            </button>
            <Link href="/admin/eventos" className="btn flex-1">
              Cancelar
            </Link>
          </div>
        </form>
      </main>
      {produtoModalOpen && (
        <ModalProduto
          open={produtoModalOpen}
          onClose={() => setProdutoModalOpen(false)}
          onSubmit={handleNovoProduto}
        />
      )}
    </>
  )
}
