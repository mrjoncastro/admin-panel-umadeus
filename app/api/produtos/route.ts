import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { filtrarProdutos, ProdutoRecord } from "@/lib/products";

export async function GET(req: NextRequest) {
  const pb = createPocketBase();
  const categoria = req.nextUrl.searchParams.get("categoria") || undefined;

  try {
    const produtos = await pb.collection("produtos").getFullList<ProdutoRecord>({
      filter: categoria ? `ativo = true && categoria = '${categoria}'` : "ativo = true",
      sort: "-created",
    });

    const ativos = filtrarProdutos(produtos, categoria);

    const comUrls = ativos.map((p) => ({
      ...p,
      imagens: (p.imagens || []).map((img) => pb.files.getUrl(p, img)),
    }));

    return NextResponse.json(comUrls);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return NextResponse.json([], { status: 500 });
  }
}
