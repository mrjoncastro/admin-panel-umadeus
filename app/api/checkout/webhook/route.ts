import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import mercadopago from "mercadopago";

const pb = new PocketBase("https://umadeus-production.up.railway.app");
pb.autoCancellation(false);

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;
    const action = body?.action;
    const type = body?.type;

    if (!paymentId || type !== "payment") {
      return NextResponse.json({ status: "Ignorado" });
    }

    if (action !== "payment.created" && action !== "payment.updated") {
      return NextResponse.json({ status: "Ignorado" });
    }

    const payment = await mercadopago.payment.findById(paymentId);
    const status = payment.body.status;
    const pedidoId = payment.body.external_reference;

    if (!pedidoId) {
      return NextResponse.json(
        { error: "Referência externa ausente no pagamento" },
        { status: 400 }
      );
    }

    if (status !== "approved") {
      return NextResponse.json({ status: "Aguardando aprovação" });
    }

    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
    }

    const pedido = await pb.collection("pedidos").getOne(pedidoId);

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

    return NextResponse.json({ status: "Pedido atualizado com sucesso" });
  } catch {
    return NextResponse.json(
      { error: "Erro no processamento do webhook" },
      { status: 500 }
    );
  }
}
