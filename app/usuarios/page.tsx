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

        const res = await fetch("/api/usuarios", {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários Cadastrados</h1>
        <Link
          href="/usuarios/novo"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm transition"
        >
          + Adicionar Novo Usuário
        </Link>
      </div>

      {mensagem && (
        <div className="mb-4 text-sm text-red-600 text-center">{mensagem}</div>
      )}

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Função</th>
                <th className="p-3">Campo</th>
                <th className="p-3">Link de Inscrição</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{usuario.nome}</td>
                  <td className="p-3">{usuario.email}</td>
                  <td className="p-3 capitalize">{usuario.role}</td>
                  <td className="p-3">{usuario.expand?.campo?.nome ?? "—"}</td>
                  <td className="p-3">
                    {usuario.role === "lider" ? (
                      <Link
                        href={`/inscricoes/${usuario.id}`}
                        className="text-blue-600 hover:underline text-sm"
                        target="_blank"
                      >
                        Ver link
                      </Link>
                    ) : (
                      "—"
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
