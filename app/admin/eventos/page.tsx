"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
    const formData = new FormData();
    if (form.titulo) formData.set("titulo", String(form.titulo));
    if (form.descricao) formData.set("descricao", String(form.descricao));
    if (form.data) formData.set("data", String(form.data));
    if (form.cidade) formData.set("cidade", String(form.cidade));
    if (form.status) formData.set("status", String(form.status));
    if (form.imagem instanceof File) {
      formData.append("imagem", form.imagem);
    }
    if (form.cobra_inscricao !== undefined) {
      formData.set(
        "cobra_inscricao",
        String(form.cobra_inscricao as boolean)
      );
    }
    if (Array.isArray(form.produtos)) {
      (form.produtos as string[]).forEach((p) => formData.append("produtos", p));
    }
    try {
      const res = await fetch("/admin/api/eventos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PB-User": JSON.stringify(user),
        },
        body: formData,
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
