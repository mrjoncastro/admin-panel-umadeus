import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logInfo } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  logInfo("PocketBase host:", pb.baseUrl);
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
  logInfo("PocketBase host:", pb.baseUrl);
  try {
    const formData = await req.formData();
    formData.set("user_org", user.id);
    const produto = await pb.collection("produtos").create(formData);
    return NextResponse.json(produto, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
