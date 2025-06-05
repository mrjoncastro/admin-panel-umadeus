import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: NextRequest) {
  const pb = new PocketBase("https://umadeus-production.up.railway.app");
  pb.autoCancellation(false);
  try {
    const body = await req.json();
    const { inscricaoId } = body;

    if (!inscricaoId) {
      return NextResponse.json(
        { erro: "ID da inscrição é obrigatório." },
        { status: 400 }
      );
    }

    const inscricao = await pb.collection("inscricoes").getOne(inscricaoId, {
      expand: "campo,criado_por",
    });

    if (!inscricao) {
      return NextResponse.json(
        { erro: "Inscrição não encontrada." },
        { status: 404 }
      );
    }

    const campoId = inscricao.expand?.campo?.id;
    const responsavelId = inscricao.expand?.criado_por;

    const valor =
      inscricao.produto === "Somente Pulseira" ? 10.00 : 50.00;

    const pedido = await pb.collection("pedidos").create({
      id_inscricao: inscricaoId,
      valor,
      status: "pendente",
      produto: inscricao.produto || "Kit Camisa + Pulseira",
      cor: "Roxo",
      tamanho: inscricao.tamanho,
      genero: inscricao.genero,
      email: inscricao.email,
      campo: campoId,
      responsavel: responsavelId,
    });

    return NextResponse.json({
      pedidoId: pedido.id,
      valor: pedido.valor,
      status: pedido.status,
    });
  } catch (err: unknown) {
    console.error("❌ Erro ao criar pedido:", err);
    return NextResponse.json(
      { erro: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
