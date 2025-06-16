import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { logInfo } from "@/lib/logger";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  try {
    const { nome, email, telefone, password, cliente } = await req.json();
    if (!nome || !email || !telefone || !password || !cliente) {
      return NextResponse.json({ error: "Dados inv\u00E1lidos" }, { status: 400 });
    }
    try {
      await pb.collection("clientes_config").getOne(String(cliente));
    } catch {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    const novoUsuario = await pb.collection("usuarios").create({
      nome: String(nome).trim(),
      email: String(email).trim(),
      cliente: String(cliente),
      telefone: String(telefone).trim(),
      password: String(password),
      passwordConfirm: String(password),
    });
    logInfo("\u2705 Usu\u00E1rio registrado com sucesso");
    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      await logConciliacaoErro(`Erro em /api/register: ${err.message}`);
    } else {
      await logConciliacaoErro("Erro desconhecido em /api/register.");
    }
    return NextResponse.json(
      { erro: "Erro ao processar a requisi\u00E7\u00E3o." },
      { status: 500 }
    );
  }
}
