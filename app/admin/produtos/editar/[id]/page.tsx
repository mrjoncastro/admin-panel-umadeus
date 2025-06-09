"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [cores, setCores] = useState<string[]>([]);
  const inputHex = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/login");
    }
  }, [isLoggedIn, router, getAuth]);

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
    fetch(`/admin/api/produtos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setInitial({
          nome: data.nome,
          preco: data.preco,
          descricao: data.descricao,
          detalhes: data.detalhes,
          checkoutUrl: data.checkout_url,
          tamanhos: data.tamanhos,
          generos: data.generos,
          categoria: data.categoria,
          ativo: data.ativo,
          cores:
            typeof data.cores === "string"
              ? data.cores
              : Array.isArray(data.cores)
              ? data.cores.join(", ")
              : "", // trata string[] ou string
        });
      })
      .finally(() => setLoading(false));
  }, [id, isLoggedIn, router, getAuth]);

  useEffect(() => {
    if (initial?.cores && typeof initial.cores === "string") {
      setCores(
        initial.cores
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean)
      );
    } else if (Array.isArray(initial?.cores)) {
      setCores(initial.cores as string[]);
    }
  }, [initial?.cores]);
  if (loading || !initial) {
    return <p className="p-4">Carregando...</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);

    // Tratamento específico para o campo de imagens
    const imagensInput = formElement.querySelector<HTMLInputElement>(
      "input[name='imagens']"
    );
    const arquivos = imagensInput?.files;
    formData.delete("imagens");
    if (arquivos && arquivos.length > 0) {
      Array.from(arquivos).forEach((file) => {
        formData.append("imagens", file);
      });
    }

    // Trata o campo de cores: insere como string separada por vírgula
    formData.delete("cores");
    if (cores.length > 0) {
      formData.append("cores", cores.join(","));
    }
    // Normaliza checkboxes e arrays
    const ativoChecked = formElement.querySelector<HTMLInputElement>(
      "input[name='ativo']"
    )?.checked;
    formData.set("ativo", ativoChecked ? "true" : "false");

    const tamanhos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='tamanhos']:checked"
      )
    ).map((el) => el.value);
    formData.delete("tamanhos");
    tamanhos.forEach((t) => formData.append("tamanhos", t));

    const generos = Array.from(
      formElement.querySelectorAll<HTMLInputElement>(
        "input[name='generos']:checked"
      )
    ).map((el) => el.value);
    formData.delete("generos");
    generos.forEach((g) => formData.append("generos", g));

    // Categoria enviada sempre pelo id
    const catSelect = formElement.querySelector<HTMLSelectElement>(
      "select[name='categoria']"
    );
    const catValue = catSelect?.value ?? "";
    formData.delete("categoria");
    if (catValue) {
      formData.append("categoria", catValue);
    }

    const { token, user } = getAuth();
    const res = await fetch(`/admin/api/produtos/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    if (res.ok) {
      router.push("/admin/produtos");
    }
  }

  function addCor(hex: string) {
    if (!hex || cores.includes(hex)) return;
    setCores([...cores, hex]);
    if (inputHex.current) inputHex.current.value = "#000000";
  }
  function removeCor(hex: string) {
    setCores(cores.filter((c) => c !== hex));
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Editar Produto
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input-base"
          name="nome"
          defaultValue={String(initial.nome)}
          required
        />
        <input
          className="input-base"
          name="preco"
          type="number"
          step="0.01"
          defaultValue={String(initial.preco)}
          required
        />
        <input
          className="input-base"
          name="checkoutUrl"
          type="url"
          defaultValue={String(initial.checkoutUrl || "")}
        />

        {/* Campo de cores HEX separadas por vírgula */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Cores do produto (clique para adicionar)
          </label>
          <div className="flex gap-2 items-center mb-2">
            <input
              type="color"
              ref={inputHex}
              defaultValue="#000000"
              className="w-10 h-10 border rounded cursor-pointer"
              // Removido o onChange!
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                if (inputHex.current) addCor(inputHex.current.value);
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
          <input type="hidden" name="cores" value={cores.join(",")} />
        </div>

        {(() => {
          const defaultCat = Array.isArray(initial.categoria)
            ? initial.categoria[0] ?? ""
            : categorias.find(
                (c) =>
                  c.id === initial.categoria || c.slug === initial.categoria
              )?.id ??
              (initial.categoria as string | "") ??
              "";
          return (
            <select
              name="categoria"
              defaultValue={defaultCat}
              className="input-base"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          );
        })()}
        <input
          type="file"
          name="imagens"
          multiple
          accept="image/*"
          className="input-base"
        />
        {/* ... tamanhos, generos, descricao, detalhes, ativo ... */}
        <div>
          <p className="text-sm font-semibold mb-1">Tamanhos</p>
          <div className="flex gap-2 flex-wrap">
            {["PP", "P", "M", "G", "GG"].map((t) => (
              <label key={t} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="tamanhos"
                  value={t}
                  defaultChecked={(
                    initial.tamanhos as string[] | undefined
                  )?.includes(t)}
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
                  defaultChecked={(
                    initial.generos as string[] | undefined
                  )?.includes(g)}
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <textarea
          className="input-base"
          name="descricao"
          rows={2}
          defaultValue={String(initial.descricao || "")}
          required
        />
        <textarea
          className="input-base"
          name="detalhes"
          rows={2}
          defaultValue={String(initial.detalhes || "")}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={Boolean(initial.ativo)}
          />{" "}
          Produto ativo
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/produtos")}
            className="btn flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
