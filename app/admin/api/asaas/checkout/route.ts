import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@/lib/asaas";
import createPocketBase from "@/lib/pocketbase";

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
  clienteId: z.string(),
  usuarioId: z.string(),
  inscricaoId: z.string().optional(),
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
      clienteId,
      usuarioId,
      inscricaoId,
      cliente,
      installments,
      paymentMethods,
    } = parse.data;

    const pb = createPocketBase();
    if (
      process.env.PB_ADMIN_EMAIL &&
      process.env.PB_ADMIN_PASSWORD &&
      !pb.authStore.isValid
    ) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );
    }

    const host = req.headers.get("host")?.split(":" )[0] ?? "";
    let apiKey = process.env.ASAAS_API_KEY || "";
    try {
      if (host) {
        const clienteRecord = await pb
          .collection("m24_clientes")
          .getFirstListItem(`dominio = "${host}"`);
        if (clienteRecord?.asaas_api_key) {
          apiKey = clienteRecord.asaas_api_key;
        }
      }
    } catch {
      /* ignore */
    }

    console.log("🔧 Chamando createCheckout com:", {
      valor,
      itens,
      successUrl,
      errorUrl,
      clienteId,
      usuarioId,
      inscricaoId,
      cliente,
      installments,
      paymentMethods,
    });

    const checkoutUrl = await createCheckout(
      {
        valor,
        itens,
        successUrl,
        errorUrl,
        clienteId,
        usuarioId,
        inscricaoId,
        cliente,
        installments,
        paymentMethods,
      },
      apiKey,
    );

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
