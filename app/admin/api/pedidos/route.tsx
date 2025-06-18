import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { logConciliacaoErro } from "@/lib/server/logger";
import type { Inscricao, Pedido } from "@/types";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  try {
    const body = await req.json();
    const { inscricaoId } = body;

    if (!inscricaoId) {
      return NextResponse.json(
        { erro: "ID da inscrição é obrigatório." },
        { status: 400 }
      );
    }

    const inscricao = await pb
      .collection("inscricoes")
      .getOne<Inscricao>(inscricaoId, {
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

    let produtoRecord: Record<string, any> | undefined;
    try {
      produtoRecord = await pb
        .collection("produtos")
        .getFirstListItem(`nome='${inscricao.produto}'`);
    } catch {
      try {
        if (inscricao.evento) {
          const ev = await pb
            .collection("eventos")
            .getOne(inscricao.evento, { expand: "produtos" });
          const lista = Array.isArray(ev.expand?.produtos)
            ? (ev.expand.produtos as Record<string, any>[])
            : [];
          produtoRecord = lista.find((p) => p.nome === inscricao.produto);
        }
      } catch {
        // noop - produtoRecord remains undefined
      }
    }

    const valor = produtoRecord?.preco ?? 0;

    const pedido = await pb.collection("pedidos").create<Pedido>({
      id_inscricao: inscricaoId,
      valor,
      status: "pendente",
      produto: produtoRecord?.nome || inscricao.produto || "Produto",
      cor: "Roxo",
      tamanho:
        inscricao.tamanho ||
        (Array.isArray(produtoRecord?.tamanhos)
          ? produtoRecord?.tamanhos[0]
          : (produtoRecord?.tamanhos as string | undefined)),
      genero:
        inscricao.genero ||
        (Array.isArray(produtoRecord?.generos)
          ? produtoRecord?.generos[0]
          : (produtoRecord?.generos as string | undefined)),
      email: inscricao.email,
      campo: campoId,
      responsavel: responsavelId,
      cliente: inscricao.cliente,
    });

    return NextResponse.json({
      pedidoId: pedido.id,
      valor: pedido.valor,
      status: pedido.status,
    });
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro ao criar pedido: ${String(err)}`);
    return NextResponse.json(
      { erro: "Erro ao criar pedido." },
      { status: 500 }
    );
  }
}
