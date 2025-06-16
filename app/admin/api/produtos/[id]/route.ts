import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logInfo } from "@/lib/logger";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  console.log("GET /produtos - pathname:", pathname, "id:", id);

  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });

  const auth = requireRole(req, "coordenador");
  console.log("GET /produtos - auth:", auth);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;

  try {
    const produto = await pb.collection("produtos").getOne(id);
    console.log("GET /produtos - produto encontrado:", produto);
    return NextResponse.json(produto, { status: 200 });
  } catch (err) {
    console.error("GET /produtos - erro:", err);
    await logConciliacaoErro(
      `Erro ao obter produto ${id}: ${String(err)} | host: ${pb.baseUrl}`
    );
    return NextResponse.json({ error: "Erro ao obter" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  console.log("PUT /produtos - pathname:", pathname, "id:", id);

  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });

  const auth = requireRole(req, "coordenador");
  console.log("PUT /produtos - auth:", auth);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;

  try {
    const formData = await req.formData();
    console.log(
      "PUT /produtos - formData recebido:",
      Object.fromEntries(formData.entries())
    );
    formData.set("user_org", user.id);

    logInfo("Atualizando produto", {
      pbHost: pb.baseUrl,
      userId: user.id,
      produtoId: id,
    });

    const produto = await pb.collection("produtos").update(id, formData);
    console.log("PUT /produtos - produto atualizado:", produto);

    return NextResponse.json(produto, { status: 200 });
  } catch (err: unknown) {
    // Para TS não reclamar:
    const pocketError = (err as { response?: unknown })?.response || err;
    console.error("PUT /produtos - erro:", err);
    console.error(
      "PocketBase erro detalhado:",
      JSON.stringify(pocketError, null, 2)
    );

    await logConciliacaoErro(
      `Erro ao atualizar produto ${id}: ${String(err)} | host: ${
        pb.baseUrl
      } | user: ${user.id}`
    );
    return NextResponse.json({ error: pocketError }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split("/").pop() ?? "";
  console.log("DELETE /produtos - pathname:", pathname, "id:", id);

  if (!id) return NextResponse.json({ error: "ID ausente" }, { status: 400 });

  const auth = requireRole(req, "coordenador");
  console.log("DELETE /produtos - auth:", auth);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;

  try {
    await pb.collection("produtos").delete(id);
    console.log("DELETE /produtos - produto excluído:", id);
    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /produtos - erro:", err);
    await logConciliacaoErro(
      `Erro ao excluir produto ${id}: ${String(err)} | host: ${pb.baseUrl}`
    );
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
