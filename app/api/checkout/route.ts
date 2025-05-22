import { NextRequest, NextResponse } from "next/server";
import mercadopago from "mercadopago";

export async function POST(req: NextRequest) {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  });
  try {
    const body = await req.json();
    const { produto, valor, tamanho, cor, email, nome } = body;

    if (!email || !valor || !produto || !tamanho || !cor || !nome) {
      return NextResponse.json(
        { error: "Dados incompletos para criar o pagamento." },
        { status: 400 }
      );
    }

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: `${produto} - ${cor} - ${tamanho}`,
          quantity: 1,
          unit_price: parseFloat(valor),
          currency_id: "BRL",
        },
      ],
      payer: {
        name: nome,
        email: email,
      },
      external_reference: `${email}-${Date.now()}`, // 🔑 chave para rastreamento no webhook
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/obrigado`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/erro`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pendente`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook`,
    });

    return NextResponse.json({ url: preference.body.init_point });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Erro no checkout:", error.message);
    }
  }
}
