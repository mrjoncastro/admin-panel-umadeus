import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  try {
    const produto = await pb.collection("produtos").getOne(id);
    return NextResponse.json(produto, { status: 200 });
  } catch (err) {
    console.error("Erro ao obter produto:", err);
    return NextResponse.json({ error: "Erro ao obter" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const formData = await req.formData();
    formData.set("user_org", user.id);
    const produto = await pb.collection("produtos").update(id, formData);
    return NextResponse.json(produto, { status: 200 });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  try {
    await pb.collection("produtos").delete(id);
    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
