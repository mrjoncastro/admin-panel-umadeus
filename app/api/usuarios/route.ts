import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/getUserFromHeaders";

export async function GET(req: NextRequest) {
  const result = await getUserFromHeaders(req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const { user, pbSafe } = result;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const usuarios = await pbSafe.collection("usuarios").getFullList({
      sort: "nome",
      expand: "campo",
    });

    console.log(`📦 ${usuarios.length} usuários encontrados.`);
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
  const result = await getUserFromHeaders(req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const { user, pbSafe } = result;

  if (user.role !== "coordenador") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { nome, email, password, passwordConfirm, role, campo } =
      await req.json();

    if (
      !nome ||
      !email ||
      !password ||
      !passwordConfirm ||
      !campo ||
      !["usuario", "lider"].includes(role)
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const novoUsuario = await pbSafe.collection("usuarios").create({
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
