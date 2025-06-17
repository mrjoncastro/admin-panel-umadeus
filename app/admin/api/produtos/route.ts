import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logInfo } from "@/lib/logger";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  try {
    const produtos = await pb.collection("produtos").getFullList({
      sort: "-created",
      filter: `user_org = "${user.id}" && cliente="${user.cliente}"`,
    });
    return NextResponse.json(produtos, { status: 200 });
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao listar produtos: ${String(err)} | host: ${pb.baseUrl} | user: ${user.id}`,
    );
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
    const formData = await req.formData();
    formData.set("user_org", user.id);
    formData.set("cliente", user.cliente as string);
    const keys = Array.from(formData.keys());
    logInfo("Criando produto", {
      pbHost: pb.baseUrl,
      userId: user.id,
      keys,
    });
    const produto = await pb.collection("produtos").create(formData);
    return NextResponse.json(produto, { status: 201 });
  } catch (err) {
    await logConciliacaoErro(
      `Erro ao criar produto: ${String(err)} | host: ${pb.baseUrl} | user: ${user.id}`,
    );
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
