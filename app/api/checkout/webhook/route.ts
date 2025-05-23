import { NextRequest, NextResponse } from "next/server";
import mercadopago from "mercadopago";
import pb from "@/lib/pocketbase"; // ajuste se seu path for diferente

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const paymentId = body?.data?.id;
    const eventType = body?.type;

    if (eventType !== "payment.updated" && eventType !== "payment.created") {
      return NextResponse.json({ status: "Ignorado" });
    }

    const payment = await mercadopago.payment.findById(paymentId);

    const status = payment.body.status; // 'approved', 'pending', etc.
    const externalReference = payment.body.external_reference;

    if (status === "approved") {
      // Aqui você pode fazer algo como:
      // externalReference = "email-timestamp"
      const email = externalReference.split("-")[0];

      // Buscar o pedido correspondente
      const pedidos = await pb.collection("pedidos").getFullList({
        filter: `email = "${email}"`,
      });

      if (pedidos.length === 0) {
        return NextResponse.json(
          { error: "Pedido não encontrado" },
          { status: 404 }
        );
      }

      const pedido = pedidos[0];

      // Atualiza o status para pago
      await pb.collection("pedidos").update(pedido.id, { status: "pago" });

      console.log(`✅ Pagamento confirmado para: ${email}`);
    }

    return NextResponse.json({ status: "Processado" });
  } catch (err: unknown) {
    console.error("❌ Erro no webhook:", err);
    return NextResponse.json(
      { error: "Erro no processamento" },
      { status: 500 }
    );
  }
}
