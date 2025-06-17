import Image from "next/image";
import InscricaoForm from "@/app/loja/components/InscricaoForm";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  imagem?: string;
}

async function getEvento(id: string): Promise<Evento | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/eventos/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Evento;
  } catch {
    return null;
  }
}
export default async function EventoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEvento(id);

  if (!evento) {
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
