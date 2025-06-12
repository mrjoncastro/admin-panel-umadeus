import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const baseUrl = process.env.ASAAS_API_URL;

  const rawBody = await req.text();
  let body: {
    payment?: {
      id?: string;
      accountId?: string;
      externalReference?: string;
    };
    event?: string;
    accountId?: string;
  };
  try {
    body = JSON.parse(rawBody) as {
      payment?: {
        id?: string;
        accountId?: string;
        externalReference?: string;
      };
      event?: string;
      accountId?: string;
    };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payment = body.payment;
  const paymentId: string | undefined = payment?.id;
  const event: string | undefined = body.event;

  if (!paymentId) {
    return NextResponse.json({ status: "Ignorado" });
  }

  if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") {
    return NextResponse.json({ status: "Ignorado" });
  }

  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!
    );
  }

  let clienteApiKey: string | null = null;
  const accountId = payment?.accountId || body.accountId;
  if (accountId) {
    try {
      const c = await pb
        .collection("m24_clientes")
        .getFirstListItem(`asaas_account_id = "${accountId}"`);
      clienteApiKey = c?.asaas_api_key ?? null;
    } catch {
      /* ignore */
    }
  }

  if (!clienteApiKey && payment?.externalReference) {
    const match = /cliente_([^_]+)/.exec(payment.externalReference);
    if (match) {
      try {
        const c = await pb.collection("m24_clientes").getOne(match[1]);
        clienteApiKey = c?.asaas_api_key ?? null;
      } catch {
        /* ignore */
      }
    }
  }

  if (!clienteApiKey) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const keyHeader = clienteApiKey.startsWith("$")
    ? clienteApiKey
    : `$${clienteApiKey}`;

  const paymentRes = await fetch(`${baseUrl}/payments/${paymentId}`, {
    headers: {
      accept: "application/json",
      "access-token": keyHeader,
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

  await pb.collection("pedidos").getOne(pedidoId, {
    expand: "id_inscricao",
  });

  return NextResponse.json({ status: "Pedido atualizado com sucesso" });
}
