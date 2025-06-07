"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "coordenador" | "lider" | "usuario";
  expand?: {
    campo?: {
      nome: string;
    };
  };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const token = localStorage.getItem("pb_token");
        const user = localStorage.getItem("pb_user");

        const res = await fetch("/admin/api/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": user ?? "",
          },
        });

        if (!res.ok) {
          const erro = await res.json();
          setMensagem("Erro ao buscar usuários: " + erro.error);
          return;
        }

        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("❌ Erro ao carregar usuários:", error);
        setMensagem("Erro inesperado ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsuarios();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="heading">Usuários Cadastrados</h2>
        <Link href="/admin/usuarios/novo" className="btn btn-primary">
          + Adicionar Novo Usuário
        </Link>
      </div>

      {mensagem && (
        <div className="mb-4 text-sm text-red-600 text-center">
          {mensagem}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Carregando usuários...</p>
      ) : (
        <div className="overflow-auto rounded-lg border bg-white border-gray-300 dark:bg-neutral-950 dark:border-gray-700 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Campo</th>
                <th>Link de Inscrição</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="font-medium">{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td className="capitalize">{usuario.role}</td>
                  <td>{usuario.expand?.campo?.nome ?? "—"}</td>
                  <td>
                    {usuario.role === "lider" ? (
                      <Link
                        href={`/admin/inscricoes/${usuario.id}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        Ver link
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
