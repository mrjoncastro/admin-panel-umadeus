// app/eventos/page.tsx
"use client";

import Image from "next/image";

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  cidade: string;
  imagem: string;
  status: "realizado" | "em breve";
}

const eventos: Evento[] = [
  {
    id: 1,
    titulo: "Congresso UMADEUS 2024",
    descricao: "Dias de avivamento, comunhão e crescimento espiritual.",
    data: "15 a 17 de Março de 2024",
    cidade: "Salvador - BA",
    imagem: "/eventos/evento1.jpg",
    status: "realizado",
  },
  {
    id: 2,
    titulo: "Vigília Jovem - Região Norte",
    descricao: "Uma noite de intercessão e louvor com a juventude baiana.",
    data: "12 de Julho de 2024",
    cidade: "Salvador - BA",
    imagem: "/eventos/evento2.jpg",
    status: "em breve",
  },
  {
    id: 3,
    titulo: "Congresso 2K25",
    descricao: "Jovens em ação levando a Palavra com criatividade e coragem!",
    data: "05 de Outubro de 2024",
    cidade: "Santaluz - BA",
    imagem: "/img/mulher2.png",
    status: "em breve",
  },
];

export default function EventosPage() {
  return (
    <main className="px-4 py-10 md:px-16">
      <h1 className="text-3xl font-bold text-center mb-10">Eventos UMADEUS</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border"
          >
            <Image
              src={evento.imagem}
              alt={`Imagem do evento ${evento.titulo}`}
              width={400}
              height={225}
              className="w-full h-56 object-cover"
            />
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
              <p className="text-sm font-medium text-gray-800">{evento.data}</p>
              <p className="text-sm text-gray-500">{evento.cidade}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
