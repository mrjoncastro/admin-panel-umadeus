import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";

export interface ModalProdutoProps<T extends Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: T) => void;
  initial?: {
    nome?: string;
    preco?: string;
    imagens?: FileList | null;
    tamanhos?: string[];
    generos?: string[];
    descricao?: string;
    detalhes?: string;
    checkoutUrl?: string;
    categoria?: string;
    ativo?: boolean;
  };
}

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export function ModalProduto<T extends Record<string, unknown>>({
  open,
  onClose,
  onSubmit,
  initial = {},
}: ModalProdutoProps<T>) {
  const ref = useRef<HTMLDialogElement>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { isLoggedIn, user: ctxUser } = useAuthContext();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch("/admin/api/categorias", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
        setCategorias([]);
      });
  }, [isLoggedIn, open, getAuth]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const form: Record<string, unknown> = Object.fromEntries(
      new FormData(formElement)
    );
    // Corrige checkboxes (arrays)
    form.tamanhos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='tamanhos']:checked"
      )
    ).map((el) => el.value);
    form.generos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='generos']:checked"
      )
    ).map((el) => el.value);
    form.ativo = !!form.ativo;
    // Corrige imagens para ser FileList ou File[]
    const imagensInput = formElement.querySelector(
      "input[name='imagens']"
    ) as HTMLInputElement;
    form.imagens =
      imagensInput && imagensInput.files && imagensInput.files.length > 0
        ? imagensInput.files
        : null;
    onSubmit(form as T);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      className="modal-base max-w-2xl w-full z-[9999]"
    >
      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-7"
        method="dialog"
        autoComplete="off"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-100 mb-4">
          <h2 className="text-xl font-bold font-heading">
            {initial?.nome ? "Editar Produto" : "Novo Produto"}
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
            <input
              className="input-base"
              name="nome"
              placeholder="Nome"
              defaultValue={initial.nome || ""}
              required
            />
          </div>
          <div>
            <label className="label-base">Preço *</label>
            <input
              className="input-base"
              name="preco"
              placeholder="Preço"
              type="number"
              step="0.01"
              defaultValue={initial.preco || ""}
              required
            />
          </div>
          <div>
            <label className="label-base">Categoria</label>
            <select
              name="categoria"
              defaultValue={initial.categoria || ""}
              className="input-base"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Checkout URL</label>
            <input
              className="input-base"
              name="checkoutUrl"
              placeholder="Checkout URL"
              type="url"
              defaultValue={initial.checkoutUrl || ""}
            />
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
          </div>
          <div>
            <label className="label-base">Tamanhos</label>
            <div className="flex gap-3 mt-1">
              {["PP", "P", "M", "G", "GG"].map((t) => (
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
          </div>
          <div>
            <label className="label-base">Gêneros</label>
            <div className="flex gap-3 mt-1">
              {["masculino", "feminino"].map((g) => (
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-base">Descrição *</label>
            <textarea
              className="input-base"
              name="descricao"
              defaultValue={initial.descricao || ""}
              rows={2}
              required
            />
          </div>
          <div>
            <label className="label-base">Detalhes</label>
            <textarea
              className="input-base"
              name="detalhes"
              defaultValue={initial.detalhes || ""}
              rows={2}
            />
          </div>
        </div>

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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Salvar
          </button>
        </div>
      </form>
    </dialog>
  );
}
