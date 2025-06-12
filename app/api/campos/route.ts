import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/getUserFromHeaders";
import { logInfo } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = await getUserFromHeaders(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { user, pbSafe } = auth;

  const tenantId =
    (user && (user as Record<string, any>).cliente) ||
    process.env.NEXT_PUBLIC_TENANT_ID;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const campos = await pbSafe.collection("campos").getFullList({
      sort: "nome",
      filter: tenantId ? `cliente='${tenantId}'` : undefined,
    });

    return NextResponse.json(campos, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/campos:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/campos.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await getUserFromHeaders(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { user, pbSafe } = auth;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const tenantId =
    (user && (user as Record<string, any>).cliente) ||
    process.env.NEXT_PUBLIC_TENANT_ID;

  try {
    const { nome } = await req.json();
    logInfo("📥 Requisição para criar campo recebida");

    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }

    const campo = await pbSafe
      .collection("campos")
      .create({ nome, ...(tenantId ? { cliente: tenantId } : {}) });

    logInfo("✅ Campo criado com sucesso");

    return NextResponse.json(campo, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/campos:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/campos.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
