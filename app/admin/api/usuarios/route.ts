import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/getUserFromHeaders";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;

  try {
    const usuarios = await pb.collection("usuarios").getFullList({
      sort: "nome",
      expand: "campo",
    });

    console.log(`📦 ${usuarios.length} usuários encontrados.`);
    return NextResponse.json(usuarios);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("❌ Erro em /api/usuarios:", err.message);
    } else {
      logger.error("❌ Erro desconhecido em /api/usuarios.");
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

  const { pb } = auth;

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
    });

    console.log("✅ Usuário criado:", novoUsuario);
    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("❌ Erro em /api/usuarios:", err.message);
    } else {
      logger.error("❌ Erro desconhecido em /api/usuarios.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisição." },
      { status: 500 }
    );
  }
}
