import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'

export interface ModalCategoriaProps {
  open: boolean
  onClose: () => void
  onSubmit: (form: { nome: string }) => void
  initial?: { nome?: string } | null
}

export default function ModalCategoria({
  open,
  onClose,
  onSubmit,
  initial,
}: ModalCategoriaProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = new FormData(e.currentTarget as HTMLFormElement)
    onSubmit({ nome: String(form.get('nome') || '') })
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="rounded-xl card max-w-sm w-full border-0 p-0 bg-white dark:bg-zinc-900 z-[9999]"
                  >
                    <Dialog.Description className="sr-only">
                      Formulário de categoria
                    </Dialog.Description>
                    <form
                      onSubmit={handleSubmit}
                      className="p-6 space-y-5"
                      autoComplete="off"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <Dialog.Title asChild>
                          <h2
                            className="text-xl font-bold"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {initial ? 'Editar Categoria' : 'Nova Categoria'}
                          </h2>
                        </Dialog.Title>
                        <button
                          type="button"
                          className="text-lg px-3 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          onClick={onClose}
                          aria-label="Fechar"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        className="input-base"
                        name="nome"
                        placeholder="Nome da categoria"
                        defaultValue={initial?.nome || ''}
                        required
                      />
                      <div className="flex justify-end gap-3 mt-4">
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
                    </form>
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
