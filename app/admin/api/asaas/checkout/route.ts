import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@/lib/asaas";

const checkoutSchema = z.object({
  valor: z.number(),
  itens: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        quantity: z.number(),
        value: z.number(),
        fotoBase64: z.string().optional().nullable(),
      })
    )
    .min(1),
  successUrl: z.string().url(),
  errorUrl: z.string().url(),
  cliente: z.object({
    nome: z.string(),
    email: z.string().email(),
    telefone: z.string(),
    cpf: z.string(),
    endereco: z.string(),
    numero: z.string(),
    estado: z.string(),
    cep: z.string(),
    cidade: z.string(),
  }),
  installments: z.number().int().min(1).max(2).optional(),
  paymentMethods: z
    .array(z.enum(["PIX", "CREDIT_CARD"]))
    .min(1)
    .max(2)
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Recebendo requisição POST em /asaas/checkout");

    const body = await req.json();
    console.log("🧾 Body recebido:\n", JSON.stringify(body, null, 2));

    const parse = checkoutSchema.safeParse(body);
    if (!parse.success) {
      console.warn("⚠️ Dados inválidos recebidos:", parse.error.flatten());
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const {
      valor,
      itens,
      successUrl,
      errorUrl,
      cliente,
      installments,
      paymentMethods,
    } = parse.data;

    console.log("🔧 Chamando createCheckout com:", {
      valor,
      itens,
      successUrl,
      errorUrl,
      cliente,
      installments,
      paymentMethods,
    });

    const checkoutUrl = await createCheckout({
      valor,
      itens,
      successUrl,
      errorUrl,
      cliente,
      installments,
      paymentMethods,
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
