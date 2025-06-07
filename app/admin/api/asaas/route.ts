import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_API_URL?.replace(/\/$/, ""); // remove barra no final

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { error: "Chave da API Asaas ou URL não configurada" },
      { status: 500 }
    );
  }

  try {
    const { pedidoId, valor } = await req.json();
    logger.info("📦 Dados recebidos:", { pedidoId, valor });

    if (!pedidoId || valor === undefined || valor === null) {
      return NextResponse.json(
        { error: "pedidoId e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const parsedValor = Number(valor);
    if (!isFinite(parsedValor) || parsedValor <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser numérico e positivo" },
        { status: 400 }
      );
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
    }

    // 🔹 Buscar o pedido
    const pedido = await pb.collection("pedidos").getOne(pedidoId);
    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // 🔹 Buscar inscrição vinculada
    const inscricao = await pb
      .collection("inscricoes")
      .getOne(pedido.id_inscricao);
    if (!inscricao) {
      return NextResponse.json(
        { error: "Inscrição associada ao pedido não encontrada" },
        { status: 404 }
      );
    }

    // 🔹 Dados do cliente para o Asaas
    const clientePayload = {
      name: "JONATAS THIAGO SANTANA CASTRO",
      email: "jonatasthiago@gmail.com",
      phone: "71996259886",
      address: "Tv Arnaldo Lopes da SILVA",
      addressNumber: "02",
      province: "BA",
      postalCode: "41770055",
      cpfCnpj: "83339837074",
    };

    const clienteResponse = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        access_token: "aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjY4NDBkZGQwLWRiYmUtNDVkYi1iMTVjLTdjMjFhZDg4Zjg3YTo6JGFhY2hfNjhlZTY1NzktOGVjMS00OTgzLWIyYTUtZTJhMjNiYjY4NDYy",
        "User-Agent": "qg3"
      },
      body: JSON.stringify(clientePayload),
    });

    console.log("Payload enviado ao Asaas:", JSON.stringify(clientePayload));

    const raw = await clienteResponse.text();

    if (!clienteResponse.ok) {
      console.error("❌ Erro ao criar cliente:", {
        status: clienteResponse.status,
        body: raw,
      });
      throw new Error("Erro ao criar cliente");
    }

    const cliente = JSON.parse(raw);
    logger.info("✅ Cliente criado:", cliente.id);

    // 🔹 Criar cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const cobrancaResponse = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
        "User-Agent": "qg3",
      },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: "BOLETO",
        value: parsedValor,
        dueDate: dueDateStr,
        description: pedido.produto || "Produto",
        externalReference: pedido.id,
      }),
    });

    if (!cobrancaResponse.ok) {
      const errorText = await cobrancaResponse.text();
      console.error("❌ Erro ao criar cobrança:", {
        status: cobrancaResponse.status,
        body: errorText,
      });
      throw new Error("Erro ao criar cobrança");
    }

    const cobranca = await cobrancaResponse.json();
    const link = cobranca.invoiceUrl || cobranca.bankSlipUrl;
    logger.info("✅ Cobrança criada. Link:", link);

    // 🔹 Atualizar pedido
    await pb.collection("pedidos").update(pedido.id, {
      link_pagamento: link,
    });

    return NextResponse.json({ url: link });
  } catch (err: unknown) {
    console.error("❌ Erro ao gerar link de pagamento Asaas:", err);
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento" },
      { status: 500 }
    );
  }
}
