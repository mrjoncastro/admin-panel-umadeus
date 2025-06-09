import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const produtos = await pb.collection("produtos").getFullList({
      sort: "-created",
      filter: `user_org = "${user.id}"`,
    });
    return NextResponse.json(produtos, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const { nome, preco, imagem } = await req.json();
    if (!nome || !preco) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const produto = await pb.collection("produtos").create({
      nome,
      preco,
      imagem,
      user_org: user.id,
    });
    return NextResponse.json(produto, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
