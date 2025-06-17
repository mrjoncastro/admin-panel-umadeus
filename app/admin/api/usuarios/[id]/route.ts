import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";

  if (!id || id.trim() === "") {
    return NextResponse.json(
      { error: "ID ausente ou inválido." },
      { status: 400 }
    );
  }

  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;

  try {
    const usuario = await pb.collection("usuarios").getOne(id, {
      expand: "campo",
    });

    return NextResponse.json(usuario, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/usuarios/[id]: ${err.message}`);
    } else {
      await logConciliacaoErro("Erro desconhecido em /api/usuarios/[id]");
    }

    return NextResponse.json(
      { error: "Erro ao carregar usuário." },
      { status: 500 }
    );
  }
}
