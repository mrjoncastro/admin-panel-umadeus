"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function EditarEventoPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== "coordenador") {
      router.replace("/admin/login");
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    fetch(`/admin/api/eventos/${id}`)
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
  }, [id]);

  if (loading || !initial) {
    return <p className="p-4">Carregando...</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    const res = await fetch(`/admin/api/eventos/${id}`, { method: "PUT", body: formData });
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
