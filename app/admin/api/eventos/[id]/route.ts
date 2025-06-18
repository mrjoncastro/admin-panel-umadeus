import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logConciliacaoErro } from "@/lib/server/logger";

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
    const evento = await pb.collection("eventos").getOne(id);
    return NextResponse.json(evento, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao obter evento: ${String(err)}`);
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
  const { pb } = auth;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const evento = await pb.collection("eventos").update(id, body);
      return NextResponse.json(evento, { status: 200 });
    }
    const formData = await req.formData();
    const evento = await pb.collection("eventos").update(id, formData);
    return NextResponse.json(evento, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao atualizar evento: ${String(err)}`);
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
    await pb.collection("eventos").delete(id);
    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao excluir evento: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
