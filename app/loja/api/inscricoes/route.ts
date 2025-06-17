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

    return NextResponse.json(record, { status: 201 });
  } catch (err: unknown) {
    console.error("Erro ao criar inscrição:", err);

    let detalhes: unknown = null;
    if (err instanceof ClientResponseError) {
      detalhes = err.response;
      if (err.originalError) {
        console.error("Erro original:", err.originalError);
      }
    } else if (err && typeof err === "object") {
      const errorData = err as Record<string, unknown>;
      if ("url" in errorData) console.error("URL chamada:", errorData.url);
      if ("status" in errorData)
        if ("response" in errorData) {
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
