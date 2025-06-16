import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logInfo } from "@/lib/logger";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  logInfo("PocketBase host:", pb.baseUrl);
  try {
    const eventos = await pb.collection("eventos").getFullList({
      sort: "-created",
      filter: `cliente='${user.cliente}'`,
    });
    return NextResponse.json(eventos, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao listar eventos: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  logInfo("PocketBase host:", pb.baseUrl);
  try {
    const data = await req.json();
    const evento = await pb
      .collection("eventos")
      .create({ ...data, cliente: user.cliente });
    return NextResponse.json(evento, { status: 201 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao criar evento: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
