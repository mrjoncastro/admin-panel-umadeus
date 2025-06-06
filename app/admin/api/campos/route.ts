import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;

  try {
    const campos = await pb.collection("campos").getFullList({
      sort: "nome",
    });

    return NextResponse.json(campos, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("❌ Erro em /api/campos:", err.message);
    } else {
      logger.error("❌ Erro desconhecido em /api/campos.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;

  try {
    const { nome } = await req.json();
    logger.info("📥 Nome recebido:", nome);

    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }

    const campo = await pb.collection("campos").create({ nome });

    logger.info("✅ Campo criado:", campo);

    return NextResponse.json(campo, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("❌ Erro em /api/campos:", err.message);
    } else {
      logger.error("❌ Erro desconhecido em /api/campos.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
