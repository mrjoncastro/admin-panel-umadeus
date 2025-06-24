'use client'

/**
 * Quando `confirmaInscricoes` está habilitado no TenantContext e o usuário não
 * possui inscrição aprovada para o evento vinculado, o modal exibe a mensagem
 * "Requer inscrição aprovada" e o botão de compra permanece desativado.
 */

import { useEffect, useRef, useState } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { calculateGross } from '@/lib/asaasFees'
import ModalCategoria from '../categorias/ModalCategoria'
import { useToast } from '@/lib/context/ToastContext'
import { Button } from '@/components/atoms/Button'
import { TextField } from '@/components/atoms/TextField'
import ToggleSwitch from '@/components/atoms/ToggleSwitch'

export interface ModalProdutoProps<T extends Record<string, unknown>> {
  open: boolean
  onClose: () => void
  onSubmit: (form: T) => void
  initial?: {
    nome?: string
    preco?: string
    imagens?: FileList | null
    tamanhos?: string[]
    generos?: string[]
    descricao?: string
    detalhes?: string
    checkout_url?: string
    categoria?: string
    ativo?: boolean
    exclusivo_user?: boolean
    cores?: string | string[]
    /** ID do evento relacionado */
    evento_id?: string | null
    /** Se verdadeiro, exige aprovação de inscrição */
    requer_inscricao_aprovada?: boolean
  }
}

interface Categoria {
  id: string
  nome: string
  slug: string
}

interface Evento {
  id: string
  titulo: string
}

// Função para gerar slug automático
function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-+/g, '-')
}

export function ModalProduto<T extends Record<string, unknown>>({
  open,
  onClose,
  onSubmit,
  initial = {},
}: ModalProdutoProps<T>) {
  const ref = useRef<HTMLDialogElement>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    initial.categoria || '',
  )
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoId, setEventoId] = useState<string>(initial.evento_id || '')
  const [requerAprov, setRequerAprov] = useState<boolean>(
    initial.requer_inscricao_aprovada ?? false,
  )
  const { isLoggedIn, user: ctxUser } = useAuthContext()
  const { showSuccess, showError } = useToast()
  const [exclusivo, setExclusivo] = useState<boolean>(
    initial.exclusivo_user ?? false,
  )

  // Novos estados para cor
  const [cores, setCores] = useState<string[]>([])
  const inputHex = useRef<HTMLInputElement | null>(null)
  const [valorCliente, setValorCliente] = useState(
    calculateGross(Number(initial.preco ?? 0), 'pix', 1).gross,
  )

  useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])

  useEffect(() => {
    if (open) {
      fetch('/api/eventos')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setEventos(data)
          else setEventos([])
        })
        .catch(() => setEventos([]))
    }
  }, [open])

  useEffect(() => {
    setSelectedCategoria(initial.categoria || '')
  }, [initial.categoria, open])

  useEffect(() => {
    setEventoId(initial.evento_id || '')
  }, [initial.evento_id, open])

  useEffect(() => {
    setRequerAprov(initial.requer_inscricao_aprovada ?? false)
  }, [initial.requer_inscricao_aprovada, open])

  useEffect(() => {
    setExclusivo(initial.exclusivo_user ?? false)
  }, [initial.exclusivo_user, open])

  useEffect(() => {
    if (!isLoggedIn || ctxUser?.role !== 'coordenador') return
    fetch('/admin/api/categorias')
      .then((r) => r.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setCategorias([])
      })
  }, [isLoggedIn, ctxUser?.role, open])

  useEffect(() => {
    if (!eventoId) {
      setRequerAprov(false)
    }
  }, [eventoId])

  // Preenche cores iniciais (em modo editar)
  useEffect(() => {
    if (initial?.cores && typeof initial.cores === 'string') {
      setCores(
        initial.cores
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean),
      )
    } else if (Array.isArray(initial?.cores)) {
      setCores(initial.cores as string[])
    }
  }, [initial?.cores, open])

  function addCor(hex: string) {
    if (!hex || cores.includes(hex)) return
    setCores([...cores, hex])
    if (inputHex.current) inputHex.current.value = '#000000'
  }
  function removeCor(hex: string) {
    setCores(cores.filter((c) => c !== hex))
  }

  async function handleNovaCategoria(form: { nome: string }) {
    if (!isLoggedIn) return
    try {
      const res = await fetch('/admin/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setCategorias((prev) => [...prev, data])
        setSelectedCategoria(data.id)
        showSuccess('Categoria criada')
      } else {
        showError('Erro ao criar categoria')
      }
    } finally {
      setCategoriaModalOpen(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formElement = e.currentTarget as HTMLFormElement
    const form: Record<string, unknown> = Object.fromEntries(
      new FormData(formElement),
    )

    // Corrige checkboxes (arrays)
    form.tamanhos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='tamanhos']:checked",
      ),
    ).map((el) => el.value)
    form.generos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='generos']:checked",
      ),
    ).map((el) => el.value)
    form.ativo = !!form.ativo
    // Corrige imagens para ser FileList ou File[]
    const imagensInput = formElement.querySelector(
      "input[name='imagens']",
    ) as HTMLInputElement
    form.imagens =
      imagensInput && imagensInput.files && imagensInput.files.length > 0
        ? imagensInput.files
        : null

    // Cores
    form.cores = cores.join(',')

    form.exclusivo_user = exclusivo

    form.evento_id = eventoId || ''
    form.requer_inscricao_aprovada = requerAprov

    // Slug automático (sempre gerado a partir do nome)
    if (typeof form.nome === 'string') {
      form.slug = slugify(form.nome)
    }

    onSubmit(form as T)
    onClose()
  }

  return (
    <>
      <dialog ref={ref} className="modal-base max-w-2xl w-full z-[9999]">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-7"
          method="dialog"
          autoComplete="off"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-neutral-100 mb-4">
            <h2 className="text-xl font-bold font-heading">
              {initial?.nome ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button
              type="button"
              className="btn btn-icon"
              onClick={onClose}
              aria-label="Fechar"
              tabIndex={0}
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-base">Nome *</label>
              <TextField
                name="nome"
                placeholder="Ex: Camiseta Básica Preta"
                defaultValue={initial.nome || ''}
                maxLength={30}
                required
              />
            </div>
            <div>
              <label className="label-base">Preço *</label>
              <TextField
                name="preco"
                placeholder="Ex: 39.90"
                type="number"
                step="0.01"
                defaultValue={initial.preco || ''}
                onChange={(e) =>
                  setValorCliente(
                    calculateGross(Number(e.target.value || 0), 'pix', 1).gross,
                  )
                }
                required
              />
              <span className="text-xs text-gray-500 ml-1">
                Valor para o cliente: R${' '}
                {valorCliente.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div>
              <label className="label-base">Categoria</label>
              <div className="flex gap-2">
                <select
                  name="categoria"
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="input-base flex-1"
                >
                  <option value="">Selecione a categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  className="whitespace-nowrap"
                  onClick={() => setCategoriaModalOpen(true)}
                >
                  + Categoria
                </Button>
              </div>
              <span className="text-xs text-gray-400 ml-1">
                Caso a categoria não exista, clique em + Categoria.
              </span>
            </div>
            <div>
              <label className="label-base">Checkout URL</label>
              <input
                className="input-base"
                name="checkout_url"
                placeholder="Ex: https://loja.com/produto"
                type="url"
                defaultValue={initial.checkout_url || ''}
              />
              <span className="text-xs text-gray-400 ml-1">
                Link externo para checkout (opcional)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-base">Imagens</label>
              <input
                type="file"
                name="imagens"
                multiple
                accept="image/*"
                className="input-base"
              />
              <span className="text-xs text-gray-400 ml-1">
                Selecione uma ou mais imagens do produto.
              </span>
            </div>
            <div>
              <label className="label-base">Tamanhos</label>
              <div className="flex gap-3 mt-1">
                {['PP', 'P', 'M', 'G', 'GG'].map((t) => (
                  <label key={t} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="tamanhos"
                      value={t}
                      defaultChecked={initial.tamanhos?.includes(t)}
                      className="checkbox-base"
                    />
                    {t}
                  </label>
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-1">
                Selecione todos os tamanhos disponíveis.
              </span>
            </div>
            <div>
              <label className="label-base">Gêneros</label>
              <div className="flex gap-3 mt-1">
                {['masculino', 'feminino'].map((g) => (
                  <label key={g} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="generos"
                      value={g}
                      defaultChecked={initial.generos?.includes(g)}
                      className="checkbox-base"
                    />
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-1">
                Marque os públicos para o produto.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-base">Descrição *</label>
              <textarea
                className="input-base"
                name="descricao"
                placeholder="Ex: Camiseta 100% algodão, confortável, não desbota."
                defaultValue={initial.descricao || ''}
                rows={2}
                maxLength={150}
                required
              />
              <span className="text-xs text-gray-400 ml-1">
                Breve descrição que será exibida na loja.
              </span>
            </div>
            <div>
              <label className="label-base">Detalhes</label>
              <textarea
                className="input-base"
                name="detalhes"
                placeholder="Detalhes adicionais: tabela de medidas, instruções de lavagem, etc."
                defaultValue={initial.detalhes || ''}
                rows={2}
              />
              <span className="text-xs text-gray-400 ml-1">
                Informações extras, se desejar.
              </span>
            </div>
          </div>

          <div>
            <label className="label-base">Evento</label>
            <select
              name="evento_id"
              value={eventoId}
              onChange={(e) => setEventoId(e.target.value)}
              className="input-base w-full"
            >
              <option value="">Nenhum</option>
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.titulo}
                </option>
              ))}
            </select>
          </div>
          {eventoId && (
            <ToggleSwitch
              label="Requer inscrição aprovada"
              checked={requerAprov}
              onChange={setRequerAprov}
              className="mt-2"
            />
          )}

          {/* Campo para selecionar cores */}
          <div>
            <label className="label-base">
              Cores do produto (clique para adicionar)
            </label>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="color"
                ref={inputHex}
                defaultValue="#000000"
                className="w-10 h-10 border rounded cursor-pointer"
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  if (inputHex.current) addCor(inputHex.current.value)
                }}
              >
                Adicionar cor
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {cores.map((cor) => (
                <div key={cor} className="flex items-center gap-1">
                  <span
                    className="w-7 h-7 rounded-full border border-gray-300 inline-block"
                    style={{ background: cor }}
                    title={cor}
                  />
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => removeCor(cor)}
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              ))}
              {cores.length === 0 && (
                <span className="text-xs text-gray-500">
                  Nenhuma cor selecionada
                </span>
              )}
            </div>
            <input type="hidden" name="cores" value={cores.join(',')} />
            <span className="text-xs text-gray-400 ml-1">
              Adicione as variações de cor do produto.
            </span>
          </div>

          <ToggleSwitch
            label="Produto de uso interno?"
            checked={exclusivo}
            onChange={setExclusivo}
            className="mt-2"
          />

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={initial.ativo ?? true}
              className="checkbox-base"
              id="produto-ativo"
            />
            <label htmlFor="produto-ativo" className="text-sm font-medium">
              Produto ativo
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-neutral-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </div>
        </form>
      </dialog>
      {categoriaModalOpen && (
        <ModalCategoria
          open={categoriaModalOpen}
          onClose={() => setCategoriaModalOpen(false)}
          onSubmit={handleNovaCategoria}
          initial={null}
        />
      )}
    </>
  )
}
