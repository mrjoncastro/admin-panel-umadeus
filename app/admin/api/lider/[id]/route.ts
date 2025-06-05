import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";

  if (!id || id.trim() === "") {
    return NextResponse.json({ erro: "ID ausente ou inválido." }, { status: 400 });
  }

  const pbSafe = createPocketBase();

  try {
    const lider = await pbSafe.collection("usuarios").getOne(id, {
      expand: "campo",
    });

    return NextResponse.json({
      nome: lider.nome,
      campo: lider.expand?.campo?.nome ?? null,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/lider/[id]:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/lider/[id].");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
