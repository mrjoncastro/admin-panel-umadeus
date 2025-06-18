"use client";

import { useEffect, useState } from "react";
import { logInfo } from "@/lib/logger";
import { useToast } from "@/lib/context/ToastContext";

interface Campo {
  id: string;
  nome: string;
}

export default function GerenciarCamposPage() {
  const { showError, showSuccess } = useToast();
  const [campos, setCampos] = useState<Campo[]>([]);
  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
  const userRaw =
    typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    async function carregarCampos() {
      logInfo("🔐 Iniciando carregamento de campos...");
      if (!token || !user) {
        logInfo("⚠️ Usuário ou token ausente.");
        showError("Usuário não autenticado.");
        return;
      }

      try {
        const res = await fetch("/api/campos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": JSON.stringify(user),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Erro ao buscar campos:", data);
          showError("Erro: " + data.error);
          return;
        }

        if (!Array.isArray(data)) {
          logInfo("⚠️ Resposta inesperada", data);
          showError("Dados inválidos recebidos.");
          return;
        }

        setCampos(data);
        showSuccess(`${data.length} campos carregados.`);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Erro:", err.message);
        }
        showError("Erro ao carregar campos.");
      }
    }

    carregarCampos();
  }, [token, user, showError, showSuccess]);

  async function handleCriarOuAtualizar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!token || !user) {
      showError("Usuário não autenticado.");
      return;
    }

    const metodo = editandoId ? "PUT" : "POST";
    const url = editandoId ? `/api/campos/${editandoId}` : "/api/campos";

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
        showSuccess(editandoId ? "Campo atualizado" : "Campo criado");
        setNome("");
        setEditandoId(null);
        await fetchCampos(); // chamada separada para carregar após salvar
      } else {
        showError("Erro: " + data.error);
        console.error("❌ Erro no envio:", data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro:", err.message);
      }
      showError("Erro ao enviar dados.");
    } finally {
      setLoading(false);
    }
  }

  const fetchCampos = async () => {
    if (!token || !user) return;

    try {
      const res = await fetch("/api/campos", {
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
      showError("Usuário não autenticado.");
      return;
    }

    try {
      const res = await fetch(`/api/campos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess("Campo excluído com sucesso");
        await fetchCampos();
      } else {
        showError("Erro: " + data.error);
        console.error("❌ Erro ao excluir:", data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro:", err.message);
      }
      showError("Erro ao excluir campo.");
    }
  }

  function iniciarEdicao(campo: Campo) {
    setEditandoId(campo.id);
    setNome(campo.nome);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Campos de Atuação</h1>

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
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          disabled={loading}
        >
          {loading ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}
        </button>
      </form>

      {/* Lista de campos */}
      <ul className="space-y-2">
        {campos.map((campo) => (
          <li
            key={campo.id}
            className="flex justify-between items-center border p-2 rounded shadow-sm"
          >
            <span>{campo.nome}</span>
            <div className="space-x-2">
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
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
