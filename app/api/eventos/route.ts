import { NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { EventoRecord, atualizarStatus } from "@/lib/events";
import { logConciliacaoErro } from "@/lib/server/logger";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
export async function GET() {
  const pb = createPocketBase();
  const tenant = await getTenantFromHost();

  if (!tenant) {
    return NextResponse.json(
      { error: "Domínio não configurado" },
      { status: 404 },
    );
  }
  try {
    const eventos = await pb.collection("eventos").getFullList<EventoRecord>({
      sort: "-data",
      filter: `cliente='${tenant}'`,
      expand: "produtos",
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
