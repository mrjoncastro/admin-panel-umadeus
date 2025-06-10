import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { filtrarProdutos, ProdutoRecord } from "@/lib/products";

export async function GET(req: NextRequest) {

  const pb = createPocketBase();
  const categoria = req.nextUrl.searchParams.get("categoria") || undefined;

  try {
    const filterString = categoria
      ? `ativo = true && categoria = '${categoria}'`
      : "ativo = true";

    const produtos = await pb
      .collection("produtos")
      .getFullList<ProdutoRecord>({
        filter: filterString,
        sort: "-created",
      });


    // Aplica filtro extra (caso sua função faça algo a mais)
    const ativos = filtrarProdutos(produtos, categoria);

    // Monta URLs completas das imagens
    const comUrls = ativos.map((p) => ({
      ...p,
      imagens: (p.imagens || []).map((img) => pb.files.getURL(p, img)),
    }));

    return NextResponse.json(comUrls);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}
