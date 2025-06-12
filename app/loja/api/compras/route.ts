import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "usuario");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const compras = await pb.collection("compras").getFullList({
      filter: `usuario = "${user.id}"`,
      sort: "-created",
    });
    return NextResponse.json(compras, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar compras:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}
