import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { EventoRecord, atualizarStatus } from "@/lib/events";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const pb = createPocketBase();
  const tenant = req.nextUrl.searchParams.get("tenant") || undefined;
  try {
    const eventos = await pb.collection("eventos").getFullList<EventoRecord>({
      sort: "-data",
      filter: tenant ? `cliente='${tenant}'` : undefined,
    });
    await atualizarStatus(eventos, pb);
    const comUrls = eventos.map((e) => ({
      ...e,
      imagem: e.imagem ? pb.files.getURL(e, e.imagem) : undefined,
    }));
    return NextResponse.json(comUrls);
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar eventos: ${String(err)}`);
    return NextResponse.json([], { status: 500 });
  }
}
