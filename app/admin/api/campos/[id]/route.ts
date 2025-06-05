import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/getUserFromHeaders";

export async function PUT(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const id = url.pathname.split("/").pop(); // /api/campos/[id]

  if (!id) {
    return NextResponse.json({ error: "ID ausente." }, { status: 400 });
  }

  const auth = await getUserFromHeaders(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { user, pbSafe } = auth;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { nome } = await req.json();

    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }

    const campo = await pbSafe.collection("campos").update(id, { nome });

    return NextResponse.json(campo, { status: 200 });
  } catch (err: unknown) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "ID ausente." }, { status: 400 });
  }

  const auth = await getUserFromHeaders(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { user, pbSafe } = auth;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    await pbSafe.collection("campos").delete(id);
    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
