import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { logInfo } from "@/lib/logger";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL ||
    "https://umadeus-production.up.railway.app"
);
pb.autoCancellation(false);

export async function POST(req: NextRequest) {
  try {
    const { cpf, telefone, cliente } = await req.json();

    console.log("📨 Dados recebidos:", { cpf, telefone });

    if (!cpf && !telefone) {
      logInfo("⚠️ CPF ou telefone não fornecido");
      return NextResponse.json(
        { error: "Informe o CPF ou telefone." },
        { status: 400 }
      );
    }

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente ausente." },
        { status: 400 }
      );
    }

    if (!pb.authStore.isValid) {
      console.log("🔐 Autenticando como admin...");
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
      logInfo("✅ Autenticado com sucesso.");
    }

    const filtroBase = cpf ? `cpf = "${cpf}"` : `telefone = "${telefone}"`;
    const filtro = `${filtroBase} && cliente='${cliente}'`;
    console.log("🔎 Filtro usado:", filtro);

    const inscricoes = await pb.collection("inscricoes").getFullList({
      filter: filtro,
      expand: "pedido",
    });

    logInfo(`📋 ${inscricoes.length} inscrição(ões) encontrada(s)`);

    if (!inscricoes.length) {
      console.warn("❌ Nenhuma inscrição encontrada.");
      return NextResponse.json(
        { error: "Inscrição não encontrada. Por favor faça a inscrição." },
        { status: 404 }
      );
    }

    const inscricao = inscricoes[0];
    const pedido = inscricao.expand?.pedido;

    logInfo("🧾 Pedido expandido com sucesso");

    if (inscricao.status === "cancelado") {
      console.log("❌ Inscrição recusada pela liderança.");
      return NextResponse.json({ status: "recusado" });
    }

    if (!inscricao.confirmado_por_lider || !pedido) {
      console.log("⏳ Inscrição aguardando confirmação da liderança.");
      return NextResponse.json({ status: "aguardando_confirmacao" });
    }

    if (pedido.status === "pago") {
      console.log("✅ Pagamento já confirmado.");
      return NextResponse.json({ status: "pago" });
    }

    if (pedido.status === "cancelado") {
      console.log("❌ Pedido cancelado.");
      return NextResponse.json({ status: "cancelado" });
    }

    console.log("⏳ Pagamento pendente. Link:", pedido.link_pagamento);

    return NextResponse.json({
      status: "pendente",
      link_pagamento: pedido.link_pagamento,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logInfo("❌ Erro na recuperação: " + error.message);
      return NextResponse.json(
        { error: "Erro interno: " + error.message },
        { status: 500 }
      );
    }

    logInfo("❌ Erro desconhecido: " + String(error));
    return NextResponse.json(
      { error: "Erro interno desconhecido" },
      { status: 500 }
    );
  }
}
