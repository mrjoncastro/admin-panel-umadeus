import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const { valor, itens, successUrl, errorUrl } = await req.json();
    if (valor === undefined || !Array.isArray(itens)) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    const checkoutUrl = await createCheckout({ valor, itens, successUrl, errorUrl });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Erro no checkout:", err);
    return NextResponse.json({ error: "Erro ao processar checkout" }, { status: 500 });
  }
}
