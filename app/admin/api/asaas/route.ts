import { NextRequest, NextResponse } from "next/server";
import { AsaasClient } from "asaas";
import { createPocketBase } from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da API Asaas ausente" },
      { status: 500 }
    );
  }

  try {
    const { pedidoId, valor, nome, email, cpf } = await req.json();

    if (!pedidoId || valor === undefined || valor === null || !nome || !email || !cpf) {
      return NextResponse.json(
        { error: "pedidoId, valor, nome, email e cpf são obrigatórios" },
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

    const pedido = await pb.collection("pedidos").getOne(pedidoId);

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
    }

    const asaas = new AsaasClient(apiKey);

    const cliente = await asaas.customers.new({
      name: nome,
      email,
      cpfCnpj: cpf.replace(/\D/g, ""),
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const cobranca = await asaas.payments.new({
      customer: cliente.id,
      billingType: "BOLETO",
      value: parsedValor,
      dueDate, // Passe o objeto Date diretamente
      description: pedido.produto || "Produto",
      externalReference: pedido.id,
    });

    const link = cobranca.invoiceUrl || cobranca.bankSlipUrl;

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
