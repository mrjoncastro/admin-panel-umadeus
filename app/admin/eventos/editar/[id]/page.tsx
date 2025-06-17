"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function EditarEventoPage() {
  const { id } = useParams<{ id: string }>();
  const { user: ctxUser, isLoggedIn } = useAuthContext();
  const getAuth = useCallback(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pb_token") : null;
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("pb_user") : null;
    const user = raw ? JSON.parse(raw) : ctxUser;
    return { token, user } as const;
  }, [ctxUser]);
  const router = useRouter();
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") {
      router.replace("/login");
    }
  }, [isLoggedIn, router, getAuth]);

  useEffect(() => {
    const { token, user } = getAuth();
    if (!isLoggedIn || !token || !user || user.role !== "coordenador") return;
    fetch(`/admin/api/eventos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setInitial({
          titulo: data.titulo,
          descricao: data.descricao,
          data: data.data,
          cidade: data.cidade,
          status: data.status,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isLoggedIn, getAuth]);

  if (loading || !initial) {
    return <LoadingOverlay show={true} text="Carregando..." />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    const { token, user } = getAuth();
    const res = await fetch(`/admin/api/eventos/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    });
    if (res.ok) {
      router.push("/admin/eventos");
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
        Editar Evento
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-base" name="titulo" defaultValue={String(initial.titulo)} required />
        <textarea className="input-base" name="descricao" rows={2} defaultValue={String(initial.descricao)} required />
        <input className="input-base" name="data" type="date" defaultValue={String(initial.data)} required />
        <input className="input-base" name="cidade" defaultValue={String(initial.cidade)} required />
        <input type="file" name="imagem" accept="image/*" className="input-base" />
        <select name="status" defaultValue={String(initial.status)} className="input-base" required>
          <option value="em breve">Em breve</option>
          <option value="realizado">Realizado</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Salvar
          </button>
          <button type="button" onClick={() => router.push("/admin/eventos")} className="btn flex-1">
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
