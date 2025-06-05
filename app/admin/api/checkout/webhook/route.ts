import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
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

    // 🔹 1. Atualiza o pedido
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
  } catch (err) {
    console.error("❌ Erro no webhook:", err);
    return NextResponse.json(
      { error: "Erro no processamento do webhook" },
      { status: 500 }
    );
  }
}
