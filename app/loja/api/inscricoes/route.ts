import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();
  console.log("Tenant ID detectado:", tenantId);

  try {
    const data = await req.json();
    console.log("Dados recebidos:", data);

    const nome = `${data.user_first_name || ""} ${
      data.user_last_name || ""
    }`.trim();
    console.log("Nome gerado:", nome);

    const registroParaCriar = {
      nome,
      email: data.user_email,
      telefone: String(data.user_phone).replace(/\D/g, ""),
      cpf: String(data.user_cpf).replace(/\D/g, ""),
      data_nascimento: data.user_birth_date,
      genero: (data.user_gender).toLowerCase(),
      campo: data.campo,
      evento: data.evento,
      status: "pendente",
      ...(tenantId ? { cliente: tenantId } : {}),
    };

    console.log("Registro a ser criado:", registroParaCriar);

    const record = await pb.collection("inscricoes").create(registroParaCriar);

    console.log("Registro criado com sucesso:", record);

    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao criar inscrição:", err);

    // Detalhes específicos do erro ClientResponseError do PocketBase
    if (err && typeof err === "object") {
      if (err.url) console.error("URL chamada:", err.url);
      if (err.status) console.error("Status HTTP:", err.status);
      if (err.response) {
        console.error(
          "Resposta do PocketBase:",
          JSON.stringify(err.response, null, 2)
        );
      }
      if (err.originalError) {
        console.error("Erro original:", err.originalError);
      }
    }

    await logConciliacaoErro(`Erro ao criar inscrição na loja: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro ao salvar", detalhes: err?.response ?? null },
      { status: 500 }
    );
  }
}
