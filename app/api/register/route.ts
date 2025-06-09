import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { logInfo } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  try {
    const { nome, email, telefone, password } = await req.json();

    if (!nome || !email || !telefone || !password) {
      return NextResponse.json({ error: "Dados inv\u00E1lidos" }, { status: 400 });
    }

    const novoUsuario = await pb.collection("usuarios").create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      telefone: String(telefone).trim(),
      password: String(password),
      passwordConfirm: String(password),
    });

    logInfo("\u2705 Usu\u00E1rio registrado com sucesso");

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("\u274C Erro em /api/register:", err.message);
    } else {
      console.error("\u274C Erro desconhecido em /api/register.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a requisi\u00E7\u00E3o." },
      { status: 500 }
    );
  }
}
