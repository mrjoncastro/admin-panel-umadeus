import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const cliente = await pb
      .collection("clientes_config")
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
    await logConciliacaoErro(`Erro ao obter configuracoes: ${String(err)}`);
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
    const cliente = await pb.collection("clientes_config").update(user.cliente, {
      cor_primary,
      logo_url,
      font,
    });
    return NextResponse.json(cliente, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao atualizar configuracoes: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
