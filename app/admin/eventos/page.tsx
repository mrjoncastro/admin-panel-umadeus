"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { ModalEvento } from "./novo/ModalEvento";
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
  const [modalOpen, setModalOpen] = useState(false);

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

  async function handleNovoEvento(form: Record<string, unknown>) {
    const { token, user } = getAuth();
    if (!isLoggedIn || !user || user.role !== "coordenador") return;
    try {
      const res = await fetch("/admin/api/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setEventos((prev) => [data, ...prev]);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Falha ao criar evento", data);
      }
    } catch (err) {
      console.error("Erro ao criar evento:", err);
    } finally {
      setModalOpen(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-[var(--space-lg)]">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Eventos
        </h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Novo Evento
        </button>
      </div>
      {modalOpen && (
        <ModalEvento
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleNovoEvento}
        />
      )}
      <div className="overflow-x-auto rounded border shadow-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <table className="table-base">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-neutral-400">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            ) : (
              eventos.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.titulo}</td>
                  <td>{ev.data ? formatDate(ev.data) : "—"}</td>
                  <td>{ev.status ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
