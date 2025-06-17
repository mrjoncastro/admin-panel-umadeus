import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { createCheckout } from "@/lib/asaas";
import type { Compra } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = requireRole(req, "usuario");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  const compraId = params.id;

  try {
    const compra = await pb.collection("compras").getOne<Compra>(compraId);

    if (compra.usuario !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (compra.status !== "pendente") {
      return NextResponse.json(
        { error: "Compra não está pendente" },
        { status: 400 },
      );
    }

    if (
      process.env.PB_ADMIN_EMAIL &&
      process.env.PB_ADMIN_PASSWORD &&
      !pb.authStore.isValid
    ) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD,
      );
    }

    const usuario = await pb.collection("usuarios").getOne(user.id);
    const cliente = await pb.collection("m24_clientes").getOne(compra.cliente);

    const itens = Array.isArray(compra.itens)
      ? compra.itens.map((i) => {
          const item = i as Record<string, any>;
          return {
            name: String(item.name || item.nome || "Item"),
            description: (item.description || item.descricao) as string | undefined,
            quantity: Number(item.quantity ?? item.quantidade ?? 1),
            value: Number(item.value ?? item.preco ?? item.valor ?? 0),
          };
        })
      : [];

    const checkoutUrl = await createCheckout(
      {
        valor: Number(compra.valor_total),
        itens,
        successUrl: `${req.nextUrl.origin}/loja/sucesso?compra=${compra.id}`,
        errorUrl: `${req.nextUrl.origin}/loja/sucesso?compra=${compra.id}`,
        clienteId: compra.cliente,
        usuarioId: user.id,
        cliente: {
          nome: String(usuario.nome || ""),
          email: String(usuario.email || ""),
          telefone: String((usuario as any).telefone || ""),
          cpf: String((usuario as any).cpf || ""),
          endereco: String((usuario as any).endereco || ""),
          numero: String((usuario as any).numero || ""),
          estado: String((usuario as any).estado || ""),
          cep: String((usuario as any).cep || ""),
          cidade: String((usuario as any).cidade || ""),
        },
        installments: 1,
        paymentMethods: ["PIX", "CREDIT_CARD"],
      },
      cliente.asaas_api_key || process.env.ASAAS_API_KEY || "",
      cliente.nome || "qg3",
    );

    try {
      await pb
        .collection("compras")
        .update(compra.id, { checkout_url: checkoutUrl });
    } catch {
      /* ignore update error */
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Erro ao gerar link de pagamento:", err);
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento" },
      { status: 500 },
    );
  }
}
