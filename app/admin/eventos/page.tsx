"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { formatDate } from "@/utils/formatDate";

interface Evento {
  id: string;
  titulo: string;
  data?: string;
  cidade?: string;
  status?: string;
}

export default function AdminEventosPage() {
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const getAuth = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw = typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);

  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/login");
    }
  }, [isLoggedIn, router, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;

    async function fetchEventos() {
      try {
        const res = await fetch("/admin/api/eventos", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PB-User": JSON.stringify(user),
          },
        });
        const data = await res.json();
        setEventos(Array.isArray(data) ? data : data.items ?? []);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
    }

    fetchEventos();
  }, [isLoggedIn, getAuth]);


  async function handleDelete(id: string) {
    if (!confirm("Confirma excluir?")) return;
    const { token, user } = getAuth();
    await fetch(`/admin/api/eventos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Eventos
        </h2>
        <Link href="/admin/eventos/novo" className="btn btn-primary">
          + Novo Evento
        </Link>
      </div>
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-neutral-400">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            ) : (
              eventos.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.titulo}</td>
                  <td>{ev.data ? formatDate(ev.data) : "—"}</td>
                  <td>{ev.status ?? "—"}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/eventos/editar/${ev.id}`}
                        className="btn"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn"
                        style={{ color: "var(--accent)" }}
                        onClick={() => handleDelete(ev.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
