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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-black_bean">
          Usuários Cadastrados
        </h1>
        <Link
          href="/usuarios/novo"
          className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
        >
          + Adicionar Novo Usuário
        </Link>
      </div>

      {mensagem && (
        <div className="mb-4 text-sm text-cornell_red text-center">
          {mensagem}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Carregando usuários...</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">E-mail</th>
                <th className="p-4 text-left">Função</th>
                <th className="p-4 text-left">Campo</th>
                <th className="p-4 text-left">Link de Inscrição</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-medium">{usuario.nome}</td>
                  <td className="p-4">{usuario.email}</td>
                  <td className="p-4 capitalize">{usuario.role}</td>
                  <td className="p-4">{usuario.expand?.campo?.nome ?? "—"}</td>
                  <td className="p-4">
                    {usuario.role === "lider" ? (
                      <Link
                        href={`/inscricoes/${usuario.id}`}
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
