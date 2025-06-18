import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import { createCheckout } from "@/lib/asaas";
import type { PaymentMethod } from "@/lib/asaasFees";
import type { Compra } from "@/types";

interface UsuarioInfo {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  numero?: string;
  estado?: string;
  cep?: string;
  cidade?: string;
}

interface ItemInfo {
  name?: string;
  nome?: string;
  description?: string;
  descricao?: string;
  quantity?: number;
  quantidade?: number;
  value?: number;
  preco?: number;
  valor?: number;
  [key: string]: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = requireRole(req, "usuario");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb, user } = auth;
  const compraId = req.nextUrl.pathname.split("/").pop() ?? "";

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

    const usuarioData = await pb.collection("usuarios").getOne(user.id);
    const usuario = usuarioData as UsuarioInfo;
    const cliente = await pb.collection("m24_clientes").getOne(compra.cliente);

    const itens = Array.isArray(compra.itens)
      ? compra.itens.map((i) => {
          const item = i as ItemInfo;
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
        valorLiquido: Number(compra.valor_total),
        paymentMethod:
          compra.metodo_pagamento === "cartao"
            ? "credito"
            : (compra.metodo_pagamento as PaymentMethod),
        itens,
        successUrl: `${req.nextUrl.origin}/loja/sucesso?compra=${compra.id}`,
        errorUrl: `${req.nextUrl.origin}/loja/sucesso?compra=${compra.id}`,
        clienteId: compra.cliente,
        usuarioId: user.id,
        cliente: {
          nome: String(usuario.nome || ""),
          email: String(usuario.email || ""),
          telefone: String(usuario.telefone ?? ""),
          cpf: String(usuario.cpf ?? ""),
          endereco: String(usuario.endereco ?? ""),
          numero: String(usuario.numero ?? ""),
          estado: String(usuario.estado ?? ""),
          cep: String(usuario.cep ?? ""),
          cidade: String(usuario.cidade ?? ""),
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
