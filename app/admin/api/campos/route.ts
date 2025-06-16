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

  try {
    const campos = await pb.collection("campos").getFullList({
      sort: "nome",
      filter: `cliente='${user.cliente}'`,
    });

    return NextResponse.json(campos, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/campos: ${err.message}`);
    } else {
      await logConciliacaoErro("Erro desconhecido em /api/campos.");
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

  const { pb, user } = auth;

  try {
    const { nome } = await req.json();
    logInfo("📥 Nome recebido: " + nome);

    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }

    const campo = await pb.collection("campos").create({ nome, cliente: user.cliente });

    logInfo("✅ Campo criado: " + JSON.stringify(campo));

    return NextResponse.json(campo, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/campos: ${err.message}`);
    } else {
      await logConciliacaoErro("Erro desconhecido em /api/campos.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
