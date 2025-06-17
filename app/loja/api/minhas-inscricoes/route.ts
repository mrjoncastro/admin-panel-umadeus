import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "usuario");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const inscricoes = await pb.collection("inscricoes").getFullList({
      filter: `criado_por="${user.id}"`,
      expand: "evento",
      sort: "-created",
    });
    return NextResponse.json(inscricoes, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar inscricoes:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}
