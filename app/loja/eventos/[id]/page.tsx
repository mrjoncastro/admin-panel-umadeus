"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import InscricaoForm from "@/app/loja/components/InscricaoForm";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  imagem?: string;
}

export default function EventoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/eventos/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Evento) => {
        setEvento(data);
        setLoading(false);
      })
      .catch(() => {
        setErro(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingOverlay show={true} text="Carregando..." />;

  if (erro || !evento) {
    return (
      <main className="px-4 py-10 md:px-16 font-sans">
        <p className="text-center text-red-500">Evento não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="px-4 py-10 md:px-16 space-y-6 font-sans">
      {evento.imagem && (
        <Image
          src={evento.imagem}
          alt={`Imagem do evento ${evento.titulo}`}
          width={640}
          height={320}
          className="w-full h-56 object-cover rounded-lg"
        />
      )}
      <h1 className="text-2xl font-bold">{evento.titulo}</h1>
      <p>{evento.descricao}</p>
      <InscricaoForm eventoId={id} />
    </main>
  );
}
