import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  try {
    const { cpf, telefone } = await req.json();

    logger.info("📨 Dados recebidos:", { cpf, telefone });

    if (!cpf && !telefone) {
      logger.warn("⚠️ CPF ou telefone não fornecido.");
      return NextResponse.json(
        { error: "Informe o CPF ou telefone." },
        { status: 400 }
      );
    }

    if (!pb.authStore.isValid) {
      logger.info("🔐 Autenticando como admin...");
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
      logger.info("✅ Autenticado com sucesso.");
    }

    const filtro = cpf ? `cpf = "${cpf}"` : `telefone = "${telefone}"`;
    logger.info("🔎 Filtro usado:", filtro);

    const inscricoes = await pb.collection("inscricoes").getFullList({
      filter: filtro,
      expand: "pedido",
    });

    logger.info("📋 Inscrições encontradas:", inscricoes.length);

    if (!inscricoes.length) {
      logger.warn("❌ Nenhuma inscrição encontrada.");
      return NextResponse.json(
        { error: "Inscrição não encontrada. Por favor faça a inscrição." },
        { status: 404 }
      );
    }

    const inscricao = inscricoes[0];
    const pedido = inscricao.expand?.pedido;

    logger.info("🧾 Pedido expandido:", pedido);

    if (inscricao.status === "cancelado") {
      logger.info("❌ Inscrição recusada pela liderança.");
      return NextResponse.json({ status: "recusado" });
    }

    if (!inscricao.confirmado_por_lider || !pedido) {
      logger.info("⏳ Inscrição aguardando confirmação da liderança.");
      return NextResponse.json({ status: "aguardando_confirmacao" });
    }

    if (pedido.status === "pago") {
      logger.info("✅ Pagamento já confirmado.");
      return NextResponse.json({ status: "pago" });
    }

    if (pedido.status === "cancelado") {
      logger.info("❌ Pedido cancelado.");
      return NextResponse.json({ status: "cancelado" });
    }

    logger.info("⏳ Pagamento pendente. Link:", pedido.link_pagamento);

    return NextResponse.json({
      status: "pendente",
      link_pagamento: pedido.link_pagamento,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("❌ Erro na recuperação:", error.message);
      return NextResponse.json(
        { error: "Erro interno: " + error.message },
        { status: 500 }
      );
    }

    logger.error("❌ Erro desconhecido:", error);
    return NextResponse.json(
      { error: "Erro interno desconhecido" },
      { status: 500 }
    );
  }
}
