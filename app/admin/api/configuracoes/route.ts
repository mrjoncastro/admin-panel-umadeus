import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const cliente = await pb
      .collection("m24_clientes")
      .getOne(user.cliente);
    return NextResponse.json(
      {
        cor_primary: cliente.cor_primary ?? "",
        logo_url: cliente.logo_url ?? "",
        font: cliente.font ?? "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro ao obter configuracoes:", err);
    return NextResponse.json({ error: "Erro ao obter" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const { cor_primary, logo_url, font } = await req.json();
    const cliente = await pb.collection("m24_clientes").update(user.cliente, {
      cor_primary,
      logo_url,
      font,
    });
    return NextResponse.json(cliente, { status: 200 });
  } catch (err) {
    console.error("Erro ao atualizar configuracoes:", err);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
