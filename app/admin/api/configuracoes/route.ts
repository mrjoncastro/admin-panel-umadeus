import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { getTenantFromHost } from "@/lib/getTenantFromHost";

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;

  let tenantId = (user as Record<string, unknown>).cliente as string | null;
  if (!tenantId) {
    tenantId = await getTenantFromHost();
  }

  if (!tenantId) {
    return NextResponse.json(
      { error: "Cliente n\u00e3o encontrado" },
      { status: 400 }
    );
  }

  try {
    const { cor_primaria, logo_url, font } = await req.json();
    const data: Record<string, unknown> = {};
    if (cor_primaria !== undefined) data.cor_primaria = cor_primaria;
    if (logo_url !== undefined) data.logo_url = logo_url;
    if (font !== undefined) data.font = font;
    await pb.collection("m24_clientes").update(tenantId, data);
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao salvar configura\u00e7\u00f5es:", err);
    return NextResponse.json(
      { error: "Erro ao salvar configura\u00e7\u00f5es" },
      { status: 500 }
    );
  }
}
