'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { TextField } from '@/components/atoms/TextField'
import ToggleSwitch from '@/components/atoms/ToggleSwitch'
import { useToast } from '@/lib/context/ToastContext'

interface Evento {
  id: string
  titulo: string
}

export interface ModalProdutoFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: Record<string, unknown>) => void
  initial?: {
    nome?: string
    descricao?: string
    preco?: number
    evento_id?: string | null
    requer_inscricao_aprovada?: boolean
    disponivel?: boolean
    imagem?: string
  }
}

export default function ModalProdutoForm({
  open,
  onClose,
  onSubmit,
  initial = {},
}: ModalProdutoFormProps) {
  const { showError } = useToast()
  const pb = useMemo(() => createPocketBase(), [])
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [preview, setPreview] = useState<string | null>(initial.imagem || null)
  const [requerAprov, setRequerAprov] = useState<boolean>(
    initial.requer_inscricao_aprovada ?? false,
  )
  const [disponivel, setDisponivel] = useState<boolean>(
    initial.disponivel ?? true,
  )
  const [eventoId, setEventoId] = useState<string>(initial.evento_id || '')

  useEffect(() => {
    if (open) {
      firstFieldRef.current?.focus()
      const headers = getAuthHeaders(pb)
      fetch('/api/eventos', { headers, credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setEventos(data)
          else setEventos([])
        })
        .catch(() => setEventos([]))
    }
  }, [open, pb])

  useEffect(() => {
    if (!eventoId) {
      setRequerAprov(false)
    }
  }, [eventoId])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(initial.imagem || null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (requerAprov && !eventoId) {
      showError('Para exigir inscrição aprovada, selecione um evento.')
      return
    }
    const formEl = e.currentTarget as HTMLFormElement
    const data = new FormData(formEl)
    data.set('requer_inscricao_aprovada', String(requerAprov))
    data.set('disponivel', String(disponivel))
    onSubmit(Object.fromEntries(data) as Record<string, unknown>)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <div className="fixed inset-0 flex items-center justify-center z-[120]">
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.form
                  role="dialog"
                  aria-labelledby="modal-produto-title"
                  aria-describedby="modal-produto-desc"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl z-[130] w-[90vw] max-w-lg space-y-5"
                >
                  <Dialog.Title
                    id="modal-produto-title"
                    className="text-xl font-bold"
                  >
                    {initial.nome ? 'Editar Produto' : 'Novo Produto'}
                  </Dialog.Title>
                  <Dialog.Description
                    id="modal-produto-desc"
                    className="sr-only"
                  >
                    Formulário de produto
                  </Dialog.Description>
                  <div className="space-y-4">
                    <div>
                      <label className="label-base">Nome *</label>
                      <input
                        ref={firstFieldRef}
                        className="input-base"
                        name="nome"
                        defaultValue={initial.nome || ''}
                        required
                      />
                    </div>
                    <div>
                      <label className="label-base">Preço *</label>
                      <TextField
                        name="preco"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={initial.preco ?? ''}
                        required
                      />
                    </div>
                    <div>
                      <label className="label-base">Descrição</label>
                      <textarea
                        className="input-base"
                        name="descricao"
                        rows={2}
                        defaultValue={initial.descricao || ''}
                      />
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
                        checked={requerAprov}
                        onChange={setRequerAprov}
                        label="Requer inscrição aprovada"
                      />
                    )}
                    <ToggleSwitch
                      checked={disponivel}
                      onChange={setDisponivel}
                      label="Disponível na loja"
                    />
                    {!disponivel && (
                      <p className="text-xs text-gray-500 ml-1">
                        Este produto não será exibido na vitrine pública.
                      </p>
                    )}
                    <div>
                      <label className="label-base">Imagem</label>
                      <input
                        type="file"
                        name="imagem"
                        accept="image/*"
                        className="input-base"
                        onChange={handleImageChange}
                      />
                      {preview && (
                        <Image
                          src={preview}
                          alt="Pré-visualização"
                          width={160}
                          height={160}
                          className="mt-2 max-h-40 rounded-md"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                </motion.form>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
