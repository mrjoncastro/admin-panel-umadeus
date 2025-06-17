import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();

  try {
    const data = await req.json();
    const nome = `${data.user_first_name || ""} ${data.user_last_name || ""}`.trim();

    const record = await pb.collection("inscricoes").create({
      nome,
      email: data.user_email,
      telefone: String(data.user_phone).replace(/\D/g, ""),
      cpf: String(data.user_cpf).replace(/\D/g, ""),
      data_nascimento: data.user_birth_date,
      genero: data.user_gender,
      campo: data.campo,
      evento: data.evento,
      status: "pendente",
      ...(tenantId ? { cliente: tenantId } : {}),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    await logConciliacaoErro(`Erro ao criar inscrição na loja: ${String(err)}`);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}
