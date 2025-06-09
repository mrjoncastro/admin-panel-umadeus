import { NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { EventoRecord, atualizarStatus } from "@/lib/events";

export async function GET() {
  const pb = createPocketBase();
  try {
    const eventos = await pb.collection("eventos").getFullList<EventoRecord>({ sort: "-data" });
    await atualizarStatus(eventos, pb);
    const comUrls = eventos.map((e) => ({
      ...e,
      imagem: e.imagem ? pb.files.getURL(e, e.imagem) : undefined,
    }));
    return NextResponse.json(comUrls);
  } catch (err) {
    console.error("Erro ao listar eventos:", err);
    return NextResponse.json([], { status: 500 });
  }
}
