import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@/lib/asaas";

const checkoutSchema = z.object({
  valor: z.number(),
  itens: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        value: z.number(),
      })
    )
    .min(1),
  successUrl: z.string(),
  errorUrl: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Recebendo requisição POST em /asaas/checkout");

    const body = await req.json();
    console.log("🧾 Body recebido:", body);

    const parse = checkoutSchema.safeParse(body);
    if (!parse.success) {
      console.warn("⚠️ Dados inválidos recebidos:", parse.error.flatten());
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const { valor, itens, successUrl, errorUrl } = parse.data;

    console.log("🔧 Chamando createCheckout com:", {
      valor,
      itens,
      successUrl,
      errorUrl,
    });

    const checkoutUrl = await createCheckout({
      valor,
      itens,
      successUrl,
      errorUrl,
    });

    console.log("✅ Checkout criado com sucesso:", checkoutUrl);

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("❌ Erro no checkout:", err);
    return NextResponse.json(
      { error: "Erro ao processar checkout" },
      { status: 500 }
    );
  }
}
