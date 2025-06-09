import { useEffect, useRef } from "react";
import { useState } from "react";
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
  const { isLoggedIn, user } = useAuthContext();

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  useEffect(() => {
    console.log(
      "[ModalProduto] Renderizou, open:",
      open,
      "isLoggedIn:",
      isLoggedIn,
      "user:",
      user
    );
    if (!isLoggedIn || !user || user.role !== "coordenador") {
      console.warn(
        "[ModalProduto] Usuário não logado, user inválido, ou sem permissão. Não irá buscar categorias."
      );
      return;
    }
    const token = localStorage.getItem("pb_token");
    const rawUser = localStorage.getItem("pb_user");
    console.log("[ModalProduto] Token recuperado:", token);
    console.log("[ModalProduto] User bruto:", rawUser);
    fetch("/admin/api/categorias", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": rawUser ?? "",
      },
    })
      .then(async (r) => {
        console.log(
          "[ModalProduto] Status da resposta fetch categorias:",
          r.status
        );
        const json = await r.json();
        console.log("[ModalProduto] JSON retornado:", json);
        return json;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCategorias(data);
          console.log("[ModalProduto] Categorias salvas:", data);
        } else if (Array.isArray(data.items)) {
          setCategorias(data.items);
          console.log(
            "[ModalProduto] Categorias (de .items) salvas:",
            data.items
          );
        } else {
          setCategorias([]);
          console.warn("[ModalProduto] Nenhuma categoria válida encontrada.");
        }
      })
      .catch((err) => {
        console.error("[ModalProduto] Erro ao buscar categorias:", err);
      });
  }, [isLoggedIn, user, open]);

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
      className="rounded-xl card max-w-lg w-full border-0 p-0 fade-in-up z-[9999]"
    >
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5"
        method="dialog"
        autoComplete="off"
      >
        <div className="flex justify-between items-center mb-3">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {initial?.nome ? "Editar Produto" : "Novo Produto"}
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

        <input
          className="input-base"
          name="nome"
          placeholder="Nome"
          defaultValue={initial.nome || ""}
          required
        />
        <input
          className="input-base"
          name="preco"
          placeholder="Preço"
          type="number"
          step="0.01"
          defaultValue={initial.preco || ""}
          required
        />
        <input
          className="input-base"
          name="checkoutUrl"
          placeholder="Checkout URL"
          type="url"
          defaultValue={initial.checkoutUrl || ""}
        />

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

        <input
          type="file"
          name="imagens"
          multiple
          accept="image/*"
          className="input-base"
        />
        <div>
          <p className="text-sm font-semibold mb-1">Tamanhos</p>
          <div className="flex gap-2 flex-wrap">
            {["PP", "P", "M", "G", "GG"].map((t) => (
              <label key={t} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="tamanhos"
                  value={t}
                  defaultChecked={initial.tamanhos?.includes(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Gêneros</p>
          <div className="flex gap-2 flex-wrap">
            {["masculino", "feminino"].map((g) => (
              <label key={g} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="generos"
                  value={g}
                  defaultChecked={initial.generos?.includes(g)}
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Descrição</p>
          <textarea
            className="input-base"
            name="descricao"
            defaultValue={initial.descricao || ""}
            rows={2}
            required
          />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Detalhes</p>
          <textarea
            className="input-base"
            name="detalhes"
            defaultValue={initial.detalhes || ""}
            rows={2}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={initial.ativo ?? true}
          />
          Produto ativo
        </label>
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
