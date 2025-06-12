import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { logInfo } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb, user } = auth;

  try {
    const usuarios = await pb.collection("usuarios").getFullList({
      sort: "nome",
      expand: "campo",
      filter: `cliente='${user.cliente}'`,
    });

    logInfo(`📦 ${usuarios.length} usuários encontrados.`);
    return NextResponse.json(usuarios);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/usuarios:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/usuarios.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb, user } = auth;

  try {
    const { nome, email, password, passwordConfirm, role, campo } =
      await req.json();

    if (
      !nome ||
      !email ||
      !password ||
      !passwordConfirm ||
      !campo ||
      !["usuario", "lider", "coordenador"].includes(role)
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const novoUsuario = await pb.collection("usuarios").create({
      nome,
      email,
      password,
      passwordConfirm,
      role,
      campo,
      cliente: user.cliente,
    });

    logInfo("✅ Usuário criado com sucesso");
    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro em /api/usuarios:", err.message);
    } else {
      console.error("❌ Erro desconhecido em /api/usuarios.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
