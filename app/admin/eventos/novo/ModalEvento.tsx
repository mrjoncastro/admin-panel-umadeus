"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import type { Produto } from "@/types";
import { ModalProduto } from "../../produtos/novo/ModalProduto";

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
    cobra_inscricao?: boolean;
    produto_inscricao?: string;
  };
}

export function ModalEvento<T extends Record<string, unknown>>({
  open,
  onClose,
  onSubmit,
  initial = {},
}: ModalEventoProps<T>) {

  const { isLoggedIn, user: ctxUser } = useAuthContext();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);

  const [cobraInscricao, setCobraInscricao] = useState(
    Boolean(initial?.cobra_inscricao)
  );
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState(
    (initial as Record<string, unknown>).produto_inscricao as string | ""
  );
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);

  useEffect(() => {
    setCobraInscricao(Boolean(initial?.cobra_inscricao));
    setSelectedProduto(
      ((initial as Record<string, unknown>).produto_inscricao as string) || ""
    );
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch("/admin/api/produtos", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setProdutos(Array.isArray(data) ? data : data.items ?? []);
      })
      .catch(() => {
        setProdutos([]);
      });
  }, [open, isLoggedIn, getAuth]);

  async function handleNovoProduto(form: Produto) {
    const formData = new FormData();
    formData.set("nome", String(form.nome ?? ""));
    formData.set("preco", String(form.preco ?? 0));
    if (form.checkout_url)
      formData.set("checkout_url", String(form.checkout_url));
    if (form.categoria) formData.set("categoria", String(form.categoria));
    if (Array.isArray(form.tamanhos)) {
      form.tamanhos.forEach((t) => formData.append("tamanhos", t));
    }
    if (Array.isArray(form.generos)) {
      form.generos.forEach((g) => formData.append("generos", g));
    }
    if (form.descricao) formData.set("descricao", String(form.descricao));
    if (form.detalhes) formData.set("detalhes", String(form.detalhes));
    if (Array.isArray(form.cores)) {
      formData.set("cores", (form.cores as string[]).join(","));
    } else if (form.cores) {
      formData.set("cores", String(form.cores));
    }
    formData.set("ativo", String(form.ativo ? "true" : "false"));
    if (form.imagens && form.imagens instanceof FileList) {
      Array.from(form.imagens).forEach((file) =>
        formData.append("imagens", file)
      );
    }

    const { token, user } = getAuth();
    try {
      const res = await fetch("/admin/api/produtos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: formData,
      });
      if (!res.ok) return;
      const data = await res.json();
      setProdutos((prev) => [data, ...prev]);
      setSelectedProduto(data.id);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    } finally {
      setProdutoModalOpen(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const form = new FormData(formElement);
    onSubmit(Object.fromEntries(form) as T);
    onClose();
  }

  return (
    <>
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
                    className="rounded-xl card max-w-lg w-full border-0 p-0 bg-white dark:bg-zinc-900 z-[9999]"
                  >
                    <Dialog.Description className="sr-only">Formulário de evento</Dialog.Description>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off">
                      <div className="flex justify-between items-center mb-3">
                        <Dialog.Title asChild>
                          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                            {initial?.titulo ? "Editar Evento" : "Novo Evento"}
                          </h2>
                        </Dialog.Title>
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
          name="titulo"
          placeholder="Título"
          defaultValue={initial.titulo || ""}
          maxLength={30}
          required
        />
        <textarea
          className="input-base"
          name="descricao"
          rows={2}
          defaultValue={initial.descricao || ""}
          maxLength={150}
          required
        />
        <input className="input-base" name="data" type="date" defaultValue={initial.data || ""} required />
        <input className="input-base" name="cidade" defaultValue={initial.cidade || ""} required />
        <input type="file" name="imagem" accept="image/*" className="input-base" />
        <select name="status" defaultValue={initial.status || "em breve"} className="input-base" required>
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
          <div>
            <label className="label-base">Produto para inscrição</label>
            <div className="flex gap-2">
              <select
                name="produto_inscricao"
                value={selectedProduto}
                onChange={(e) => setSelectedProduto(e.target.value)}
                className="input-base flex-1"
              >
                <option value="">Selecione o produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary whitespace-nowrap"
                onClick={() => setProdutoModalOpen(true)}
              >
                + Produto
              </button>
            </div>
          </div>
        )}
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
          </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
      </Dialog.Root>
    {produtoModalOpen && (
      <ModalProduto
        open={produtoModalOpen}
        onClose={() => setProdutoModalOpen(false)}
        onSubmit={handleNovoProduto}
      />
    )}
    </>
  );
}
