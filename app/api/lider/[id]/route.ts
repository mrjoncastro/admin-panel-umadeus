import { NextRequest, NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

export async function GET(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const id = url.pathname.split("/").pop();

  if (!id || id.trim() === "") {
    return NextResponse.json({ erro: "ID ausente ou inválido." }, { status: 400 });
  }

  try {
    const lider = await pb.collection("usuarios").getOne(id, {
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
