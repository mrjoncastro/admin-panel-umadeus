import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { filtrarProdutos, ProdutoRecord } from "@/lib/products";

export async function GET(req: NextRequest) {
  console.log("[/api/produtos] Chamada recebida!", req.method, req.url);

  const pb = createPocketBase();
  const categoria = req.nextUrl.searchParams.get("categoria") || undefined;
  console.log("[/api/produtos] Parâmetro categoria:", categoria);

  try {
    const filterString = categoria
      ? `ativo = true && categoria = '${categoria}'`
      : "ativo = true";
    console.log("[/api/produtos] Filtro PocketBase:", filterString);

    const produtos = await pb
      .collection("produtos")
      .getFullList<ProdutoRecord>({
        filter: filterString,
        sort: "-created",
      });

    console.log("[/api/produtos] Produtos retornados do PB:", produtos);

    // Aplica filtro extra (caso sua função faça algo a mais)
    const ativos = filtrarProdutos(produtos, categoria);
    console.log("[/api/produtos] Produtos após filtrarProdutos:", ativos);

    // Monta URLs completas das imagens
    const comUrls = ativos.map((p) => ({
      ...p,
      imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
    }));
    console.log("[/api/produtos] Produtos prontos para resposta:", comUrls);

    return NextResponse.json(comUrls);
  } catch (err) {
    console.error("[/api/produtos] Erro ao listar produtos:", err);
    return NextResponse.json([], { status: 500 });
  }
}
