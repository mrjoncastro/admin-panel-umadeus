import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const rawEnvKey = process.env.ASAAS_API_KEY;

  if (!rawEnvKey) {
    throw new Error(
      "❌ ASAAS_API_KEY não definida! Confira seu .env ou painel de variáveis."
    );
  }

  // Se não começar com '$', adiciona manualmente.
  const apiKey = rawEnvKey.startsWith("$") ? rawEnvKey : "$" + rawEnvKey;
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

  const paymentRes = await fetch(
    `https://api.asaas.com/v3/payments/${paymentId}`,
    {
      headers: {
        access_token: apiKey,
      },
    }
  );

  if (!paymentRes.ok) {
    return NextResponse.json(
      { error: "Falha ao obter pagamento" },
      { status: 500 }
    );
  }

  const payment = await paymentRes.json();
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

  await pb.collection("pedidos").getOne(pedidoId, {
    expand: "id_inscricao",
  });

  return NextResponse.json({ status: "Pedido atualizado com sucesso" });
}
