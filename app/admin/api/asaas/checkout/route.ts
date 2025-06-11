import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Recebendo requisição POST em /asaas/checkout");

    const body = await req.json();
    console.log("🧾 Body recebido:", body);

    const { valor, itens, successUrl, errorUrl } = body;

    if (
      typeof valor !== "number" ||
      !Array.isArray(itens) ||
      itens.length === 0 ||
      !itens.every((i) => i.name && i.quantity && i.value)
    ) {
      console.warn("⚠️ Dados inválidos recebidos:", { valor, itens });
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

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
