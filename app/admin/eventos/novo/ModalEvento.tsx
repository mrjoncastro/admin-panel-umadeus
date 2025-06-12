import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalEventoProps<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: T) => void;
  initial?: {
    titulo?: string;
    descricao?: string;
    data?: string;
    cidade?: string;
    imagem?: FileList | null;
    status?: "realizado" | "em breve";
  };
}

export function ModalEvento<T extends Record<string, unknown>>({
  open,
  onClose,
  onSubmit,
  initial = {},
}: ModalEventoProps<T>) {

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const form = new FormData(formElement);
    onSubmit(Object.fromEntries(form) as T);
    onClose();
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="rounded-xl card max-w-lg w-full border-0 p-0 bg-white dark:bg-zinc-900 z-[9999]"
              >
                <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {initial?.titulo ? "Editar Evento" : "Novo Evento"}
            </h2>
            <button
              type="button"
              className="text-lg px-3 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={onClose}
              aria-label="Fechar"
              tabIndex={0}
            >
              ×
            </button>
          </div>

        <input className="input-base" name="titulo" placeholder="Título" defaultValue={initial.titulo || ""} required />
        <textarea className="input-base" name="descricao" rows={2} defaultValue={initial.descricao || ""} required />
        <input className="input-base" name="data" type="date" defaultValue={initial.data || ""} required />
        <input className="input-base" name="cidade" defaultValue={initial.cidade || ""} required />
        <input type="file" name="imagem" accept="image/*" className="input-base" />
        <select name="status" defaultValue={initial.status || "em breve"} className="input-base" required>
          <option value="em breve">Em breve</option>
          <option value="realizado">Realizado</option>
        </select>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
