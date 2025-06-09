"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Link from "next/link";
import type { Evento } from "@/types";
import { ModalEvento } from "./novo/ModalEvento";

const EVENTOS_POR_PAGINA = 10;

export default function AdminEventosPage() {
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") return;

    async function fetchEventos() {
      try {
        const res = await fetch("/admin/api/eventos");
        const data = await res.json();
        setEventos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
    }
    fetchEventos();
  }, [isLoggedIn, user]);

  const totalPages = Math.ceil(eventos.length / EVENTOS_POR_PAGINA);
  const paginated = eventos.slice((page - 1) * EVENTOS_POR_PAGINA, page * EVENTOS_POR_PAGINA);

  const handleNovoEvento = (form: Evento) => {
    const evento: Evento = {
      id: crypto.randomUUID(),
      titulo: String(form.titulo ?? ""),
      descricao: String(form.descricao ?? ""),
      data: String(form.data ?? ""),
      cidade: String(form.cidade ?? ""),
      status: (form.status as Evento["status"]) ?? "em breve",
    };
    setEventos((prev) => [evento, ...prev]);
    setModalOpen(false);
    setPage(1);
  };

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

      <nav className="mb-6 border-b border-neutral-200 dark:border-neutral-700 flex gap-4">
        <Link
          href="/admin/eventos"
          className={`pb-2 ${pathname === "/admin/eventos" ? "border-b-2 border-[var(--accent)]" : "hover:text-[var(--accent)]"}`}
        >
          Eventos
        </Link>
      </nav>

      {modalOpen && (
        <ModalEvento<Evento>
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-neutral-400">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            ) : (
              paginated.map((evento) => (
                <tr key={evento.id}>
                  <td className="font-medium">{evento.titulo}</td>
                  <td>{new Date(evento.data).toLocaleDateString("pt-BR")}</td>
                  <td>{evento.status === "realizado" ? <span className="text-green-600 font-semibold">Realizado</span> : <span className="text-yellow-600 font-semibold">Em breve</span>}</td>
                  <td>
                    <Link href={`/admin/eventos/editar/${evento.id}`} className="text-[var(--accent)] hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-[var(--space-md)] mt-[var(--space-lg)]">
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}
