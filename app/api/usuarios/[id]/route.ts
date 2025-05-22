import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/getUserFromHeaders";

export async function GET(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const id = url.pathname.split("/").pop();

  if (!id || id.trim() === "") {
    return NextResponse.json(
      { error: "ID ausente ou inválido." },
      { status: 400 }
    );
  }

  const result = await getUserFromHeaders(req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const { user, pbSafe } = result;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const usuario = await pbSafe.collection("usuarios").getOne(id, {
      expand: "campo",
    });

    return NextResponse.json(usuario, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/usuarios/[id]:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/usuarios/[id]");
    }

    return NextResponse.json(
      { error: "Erro ao carregar usuário." },
      { status: 500 }
    );
  }
}
