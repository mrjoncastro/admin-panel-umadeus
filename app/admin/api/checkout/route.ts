import { NextRequest, NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { createPocketBase } from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!accessToken) {
    return NextResponse.json(
      { error: "Token de acesso ausente" },
      { status: 500 }
    );
  }

  mercadopago.configure({ access_token: accessToken });

  try {
    const { pedidoId, valor } = await req.json();

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

    const pedido = await pb.collection("pedidos").getOne(pedidoId);

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: `${pedido.produto || "Produto"} - ${pedido.cor || "Cor"} - ${
            pedido.tamanho || "Tamanho"
          }`,
          quantity: 1,
          unit_price: parsedValor,
          currency_id: "BRL",
        },
      ],
      payer: {
        name: (pedido.responsavel || "Cliente").toString().substring(0, 100),
        email: pedido.email || "sememail@teste.com",
      },
      external_reference: pedido.id,
      back_urls: {
        success: `${siteUrl}/obrigado`,
        failure: `${siteUrl}/erro`,
        pending: `${siteUrl}/pendente`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/checkout/webhook`,
    });

    // Autentica como admin caso necessário
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
    }

    // Atualiza o link de pagamento no pedido
    await pb.collection("pedidos").update(pedido.id, {
      link_pagamento: preference.body.init_point,
    });

    return NextResponse.json({ url: preference.body.init_point });
  } catch (err: unknown) {
    console.error("❌ Erro ao gerar link de pagamento:", err);
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento" },
      { status: 500 }
    );
  }
}
