// app/eventos/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatDate } from "@/utils/formatDate";
import InscricaoForm from "../components/InscricaoForm";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  cidade: string;
  imagem?: string;
  status: "realizado" | "em breve";
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id");
    fetch(`/api/eventos?tenant=${tenantId ?? ""}`)
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setEventos(data) : setEventos([])))
      .catch((err) => {
        console.error("Erro ao carregar eventos:", err);
      });
  }, []);

  return (
    <main className="px-4 py-10 md:px-16 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-10">Eventos UMADEUS</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border"
          >
            {evento.imagem && (
              <Image
                src={evento.imagem}
                alt={`Imagem do evento ${evento.titulo}`}
                width={640}
                height={320}
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-4 space-y-2">
              <span
                className={`inline-block text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold ${
                  evento.status === "realizado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {evento.status === "realizado" ? "Realizado" : "Em breve"}
              </span>
              <h2 className="text-lg font-semibold">{evento.titulo}</h2>
              <p className="text-sm text-gray-600">{evento.descricao}</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(evento.data)}</p>
              <p className="text-sm text-gray-500">{evento.cidade}</p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setSelectedEventoId(evento.id)}
              >
                Inscrever
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedEventoId && <InscricaoForm eventoId={selectedEventoId} />}
    </main>
  );
}

