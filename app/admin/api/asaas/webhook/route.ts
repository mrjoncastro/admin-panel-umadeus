import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const rawEnvKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_API_URL;

  if (!rawEnvKey) {
    throw new Error(
      "❌ ASAAS_API_KEY não definida! Confira seu .env ou painel de variáveis."
    );
  }

  // Se não começar com '$', adiciona manualmente.
  const apiKey = rawEnvKey.startsWith("$") ? rawEnvKey : "$" + rawEnvKey;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da API Asaas ausente" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const paymentId = body?.payment?.id;
  const event = body?.event;

  if (!paymentId) {
    return NextResponse.json({ status: "Ignorado" });
  }

  if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") {
    return NextResponse.json({ status: "Ignorado" });
  }

  const paymentRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
    headers: {
      accept: "application/json",
      "access-token": apiKey,
      "User-Agent": "qg3",
    },
  });

  if (!paymentRes.ok) {
    const errorBody = await paymentRes.text();
    return NextResponse.json(
      { error: "Falha ao obter pagamento", details: errorBody },
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
