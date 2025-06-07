"use client";

import { useEffect, useState } from "react";

interface Campo {
  id: string;
  nome: string;
}

export default function GerenciarCamposPage() {
  const [campos, setCampos] = useState<Campo[]>([]);
  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
  const userRaw =
    typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    async function carregarCampos() {
      console.log("🔐 Iniciando carregamento de campos...");
      if (!token || !user) {
        console.warn("⚠️ Usuário ou token ausente.");
        setMensagem("Usuário não autenticado.");
        return;
      }

      try {
        const res = await fetch("/admin/api/campos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": JSON.stringify(user),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Erro ao buscar campos:", data);
          setMensagem("Erro: " + data.error);
          return;
        }

        if (!Array.isArray(data)) {
          console.warn("⚠️ Resposta inesperada:", data);
          setMensagem("Dados inválidos recebidos.");
          return;
        }

        setCampos(data);
        setMensagem(`✅ ${data.length} campos carregados.`);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Erro:", err.message);
        }
      }
    }

    carregarCampos();
  }, [token, user]);

  async function handleCriarOuAtualizar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    if (!token || !user) {
      setMensagem("Usuário não autenticado.");
      return;
    }

    const metodo = editandoId ? "PUT" : "POST";
    const url = editandoId ? `/admin/api/campos/${editandoId}` : "/admin/api/campos";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: JSON.stringify({ nome }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem(editandoId ? "✅ Campo atualizado" : "✅ Campo criado");
        setNome("");
        setEditandoId(null);
        await fetchCampos(); // chamada separada para carregar após salvar
      } else {
        setMensagem("Erro: " + data.error);
        console.error("❌ Erro no envio:", data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const fetchCampos = async () => {
    if (!token || !user) return;

    try {
      const res = await fetch("/admin/api/campos", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      });
      const data = await res.json();
      if (res.ok) setCampos(data);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
    }
  };

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este campo?")) return;

    if (!token || !user) {
      setMensagem("Usuário não autenticado.");
      return;
    }

    try {
      const res = await fetch(`/admin/api/campos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem("✅ Campo excluído com sucesso");
        await fetchCampos();
      } else {
        setMensagem("Erro: " + data.error);
        console.error("❌ Erro ao excluir:", data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro:", err.message);
      }
    }
  }

  function iniciarEdicao(campo: Campo) {
    setEditandoId(campo.id);
    setNome(campo.nome);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="heading">Gerenciar Campos de Atuação</h1>
        <button
          onClick={() => {
            setEditandoId(null);
            setNome("");
          }}
          className="btn btn-primary"
        >
          + Novo Campo
        </button>
      </div>

      {mensagem && (
        <div className="mb-4 text-sm text-center text-gray-800">{mensagem}</div>
      )}

      {/* Formulário de criação/edição */}
      <form onSubmit={handleCriarOuAtualizar} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Nome do Campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="btn btn-danger w-full"
          disabled={loading}
        >
          {loading ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}
        </button>
      </form>

      {/* Lista de campos */}
      <div className="overflow-x-auto rounded-lg border bg-white border-gray-300 dark:bg-neutral-950 dark:border-gray-700 shadow-sm">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {campos.map((campo) => (
              <tr key={campo.id}>
                <td>{campo.nome}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => iniciarEdicao(campo)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(campo.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
