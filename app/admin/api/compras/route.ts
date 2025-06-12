import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const compras = await pb.collection("compras").getFullList({
      filter: `cliente = "${user.cliente}"`,
      sort: "-created",
    });
    return NextResponse.json(compras, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar compras:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "usuario");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const data = await req.json();
    data.cliente = user.cliente;
    data.usuario = user.id;
    const compra = await pb.collection("compras").create(data);
    return NextResponse.json(compra, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar compra:", err);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
