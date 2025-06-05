import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id || id.trim() === "") {
    return NextResponse.json({ erro: "ID ausente ou inválido." }, { status: 400 });
  }

  const pbSafe = new PocketBase("https://umadeus-production.up.railway.app");
  pbSafe.autoCancellation(false);

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
