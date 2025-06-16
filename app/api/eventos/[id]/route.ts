import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });

  const pb = createPocketBase();
  try {
    const evento = await pb.collection("eventos").getOne(id);
    const withUrl = {
      ...evento,
      imagem: evento.imagem ? pb.files.getURL(evento, evento.imagem) : undefined,
    };
    return NextResponse.json(withUrl, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao obter evento: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao obter" }, { status: 500 });
  }
}
