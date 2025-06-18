"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/context/ToastContext";
import { useRouter } from "next/navigation";

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
  const [camposCarregados, setCamposCarregados] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
  const userRaw =
    typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (!token || !user || user.role !== "coordenador") {
      router.replace("/login");
    }
  }, [token, user, router]);

  useEffect(() => {
    if (!token || !user || user.role !== "coordenador" || camposCarregados) return;

    const carregarCampos = async () => {
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
          showError("Erro: " + data.error);
          return;
        }

        if (!Array.isArray(data)) {
          showError("Dados inválidos recebidos.");
          return;
        }

        setCampos(data);
        setCamposCarregados(true); // Só carrega uma vez!
      } catch (err) {
        showError("Erro ao carregar campos.");
        console.error(err);
      }
    };

    carregarCampos();
  }, [token, user, camposCarregados, showError]);

  async function handleCriarOuAtualizar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!token || !user || user.role !== "coordenador") {
      showError("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const metodo = editandoId ? "PUT" : "POST";
    const url = editandoId
      ? `/admin/api/campos/${editandoId}`
      : "/admin/api/campos";

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
    if (!token || !user || user.role !== "coordenador") return;

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

  // Obsoleto: mantido para referência futura
  // async function handleExcluir(id: string) {
  //   if (!confirm("Tem certeza que deseja excluir este campo?")) return;
  //
  //   if (!token || !user) {
  //     setMensagem("Usuário não autenticado.");
  //     return;
  //   }
  //
  //   try {
  //     const res = await fetch(`/admin/api/campos/${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "X-PB-User": JSON.stringify(user),
  //       },
  //     });
  //
  //     const data = await res.json();
  //
  //     if (res.ok) {
  //       setMensagem("✅ Campo excluído com sucesso");
  //       await fetchCampos();
  //     } else {
  //       setMensagem("Erro: " + data.error);
  //       console.error("❌ Erro ao excluir:", data);
  //     }
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       console.error("Erro:", err.message);
  //     }
  //   }
  // }

  // function iniciarEdicao(campo: Campo) {
  //   setEditandoId(campo.id);
  //   setNome(campo.nome);
  // }

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Handler para novo campo
  function handleNovoCampo() {
    setEditandoId(null);
    setNome("");
    setMostrarFormulario(true);
  }

  // Handler para editar
  function handleEditarCampo(campo: Campo) {
    setEditandoId(campo.id);
    setNome(campo.nome);
    setMostrarFormulario(true);
  }

  // Handler de cancelamento
  function handleCancelar() {
    setMostrarFormulario(false);
    setEditandoId(null);
    setNome("");
  }

  async function handleExcluirCampo(id: string) {
    try {
      setLoading(true);
      if (!token || !user || user.role !== "coordenador") {
        showError("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      const res = await fetch(`/admin/api/campos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
      });
      if (!res.ok) {
        const data = await res.json();
        showError("Erro: " + (data.error || "Não foi possível excluir."));
      } else {
        showSuccess("Campo excluído com sucesso.");
        setCampos((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      showError("Erro ao excluir campo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="heading">Campos Cadastrados</h2>

        <button onClick={handleNovoCampo} className="btn btn-primary">
          + Novo Campo
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleCriarOuAtualizar}
          className="w-full max-w-md mx-auto card mb-8"
        >
          <input
            type="text"
            placeholder="Nome do Campo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-base"
            required
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}
            </button>
            <button
              type="button"
              className="btn flex-1"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="w-full max-w-2xl mx-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-2/3">Nome do Campo</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {campos.map((campo) => (
              <tr key={campo.id}>
                <td>{campo.nome}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn"
                      onClick={() => handleEditarCampo(campo)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn"
                      style={{ color: "var(--accent)" }}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Tem certeza que deseja excluir este campo?"
                          )
                        ) {
                          handleExcluirCampo(campo.id);
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </main>
    </>
  );
}
