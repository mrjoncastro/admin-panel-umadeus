import { useEffect, useRef } from "react";

export interface ModalCategoriaProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: { nome: string }) => void;
  initial?: { nome?: string } | null;
}

export default function ModalCategoria({
  open,
  onClose,
  onSubmit,
  initial,
}: ModalCategoriaProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    onSubmit({ nome: String(form.get("nome") || "") });
    onClose();
  }

  return (
    <dialog ref={ref} className="rounded-xl card max-w-sm w-full border-0 p-0 fade-in-up z-[9999]">
      <form onSubmit={handleSubmit} className="p-6 space-y-5" method="dialog" autoComplete="off">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {initial ? "Editar Categoria" : "Nova Categoria"}
          </h2>
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
          defaultValue={initial?.nome || ""}
          required
        />
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </form>
    </dialog>
  );
}
