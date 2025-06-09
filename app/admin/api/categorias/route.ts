import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  try {
    const categorias = await pb.collection("categorias").getFullList({ sort: "nome" });
    return NextResponse.json(categorias, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  try {
    const { nome } = await req.json();
    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }
    const slug = nome.toLowerCase().replace(/\s+/g, "-");
    const categoria = await pb.collection("categorias").create({ nome, slug });
    return NextResponse.json(categoria, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar categoria:", err);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
