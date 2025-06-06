import { NextRequest, NextResponse } from "next/server";
import { AsaasClient } from "asaas";
import { createPocketBase } from "@/lib/pocketbase";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const apiKey = process.env.ASAAS_API_KEY;
  const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da API Asaas ausente" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  if (webhookSecret) {
    const signature = req.headers.get("asaas-signature");
    const expected = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (!signature || signature !== expected) {
      return NextResponse.json(
        { error: "Assinatura do webhook inválida" },
        { status: 401 }
      );
    }
  }

  const body = JSON.parse(rawBody);
  const paymentId = body?.payment?.id;
  const event = body?.event;

  if (!paymentId) {
    return NextResponse.json({ status: "Ignorado" });
  }

  if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") {
    return NextResponse.json({ status: "Ignorado" });
  }

  const asaas = new AsaasClient(apiKey);
  const payment = await asaas.payments.getById(paymentId);
  const status = payment.status;
  const pedidoId = payment.externalReference;

  if (!pedidoId) {
    return NextResponse.json(
      { error: "Referência externa ausente no pagamento" },
      { status: 400 }
    );
  }

  if (status !== "RECEIVED" && status !== "CONFIRMED") {
    return NextResponse.json({ status: "Aguardando pagamento" });
  }

  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    );
  }

  const pedido = await pb.collection("pedidos").getOne(pedidoId, {
    expand: "id_inscricao",
  });

  if (!pedido) {
    return NextResponse.json(
      { error: "Pedido não encontrado" },
      { status: 404 }
    );
  }

  await pb.collection("pedidos").update(pedido.id, {
    status: "pago",
    id_pagamento: paymentId,
  });

  const inscricaoId = pedido.expand?.id_inscricao?.id;

  if (inscricaoId) {
    await pb.collection("inscricoes").update(inscricaoId, {
      status: "confirmado",
    });
  }

  return NextResponse.json({
    status: "Pedido e inscrição atualizados com sucesso",
  });
}
