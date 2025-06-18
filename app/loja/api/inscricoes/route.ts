import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { ClientResponseError } from "pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();

  try {
    const data = await req.json();

    const nome = `${data.user_first_name || ""} ${
      data.user_last_name || ""
    }`.trim();

    const registroParaCriar = {
      nome,
      email: data.user_email,
      telefone: String(data.user_phone).replace(/\D/g, ""),
      cpf: String(data.user_cpf).replace(/\D/g, ""),
      data_nascimento: data.user_birth_date,
      genero: data.user_gender.toLowerCase(),
      campo: data.campo,
      evento: data.evento,
      status: "pendente",
      ...(tenantId ? { cliente: tenantId } : {}),
    };

    const record = await pb.collection("inscricoes").create(registroParaCriar);

    let link_pagamento: string | undefined;

    if (tenantId) {
      try {
        const cfg = await pb
          .collection("clientes_config")
          .getFirstListItem(`cliente='${tenantId}'`);

        if (cfg?.confirma_inscricoes === false) {
          const base = req.nextUrl.origin;

          const pedidoRes = await fetch(`${base}/admin/api/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inscricaoId: record.id }),
          });

          if (pedidoRes.ok) {
            const { pedidoId, valor } = await pedidoRes.json();

            const asaasRes = await fetch(`${base}/admin/api/asaas`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pedidoId,
                valorBruto: valor,
                paymentMethod: "pix",
                installments: 1,
              }),
            });

            if (asaasRes.ok) {
              const data = await asaasRes.json();
              link_pagamento = data.url;
            }
          }
        }
      } catch (e) {
        console.error("Erro ao gerar pagamento automático:", e);
      }
    }

    return NextResponse.json(
      link_pagamento ? { ...record, link_pagamento } : record,
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Erro ao criar inscrição:", err);

    let detalhes: unknown = null;
    if (err instanceof ClientResponseError) {
      console.error("URL chamada:", err.url);
      console.error("Status HTTP:", err.status);
      console.error(
        "Resposta do PocketBase:",
        JSON.stringify(err.response, null, 2)
      );
      detalhes = err.response;
      if (err.originalError) {
        console.error("Erro original:", err.originalError);
      }
    } else if (err && typeof err === "object") {
      const errorData = err as Record<string, unknown>;
      if ("url" in errorData) console.error("URL chamada:", errorData.url);
      if ("status" in errorData) console.error("Status HTTP:", errorData.status);
      if ("response" in errorData) {
        console.error(
          "Resposta do PocketBase:",
          JSON.stringify(errorData.response, null, 2)
        );
        detalhes = errorData.response;
      }
      if ("originalError" in errorData) {
        console.error("Erro original:", errorData.originalError);
      }
    }

    await logConciliacaoErro(`Erro ao criar inscrição na loja: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro ao salvar", detalhes },
      { status: 500 }
    );
  }
}
