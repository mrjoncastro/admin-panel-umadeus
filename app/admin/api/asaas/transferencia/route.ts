import { NextRequest, NextResponse } from "next/server";
import { requireClienteFromHost } from "@/lib/clienteAuth";
import { logInfo } from "@/lib/logger";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  const auth = await requireClienteFromHost(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { cliente } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || "";
  const userAgent = cliente.nome || "qg3";

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 },
    );
  }

  logInfo("🔑 API Key utilizada:", apiKey);

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;

  try {
    const body = await req.json();
    const res = await fetch(`${baseUrl}/transfers`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "access-token": keyHeader,
        "User-Agent": userAgent,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      await logConciliacaoErro(`Erro ao criar transferência: ${errorBody}`);
      return NextResponse.json(
        { error: "Falha ao criar transferência" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    await logConciliacaoErro(
      `Erro inesperado ao criar transferência: ${String(err)}`,
    );
    return NextResponse.json(
      { error: "Erro ao criar transferência" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireClienteFromHost(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { cliente } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  const apiKey = cliente.asaas_api_key || process.env.ASAAS_API_KEY || "";
  const userAgent = cliente.nome || "qg3";

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 },
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Id obrigatório" }, { status: 400 });
  }

  logInfo("🔑 API Key utilizada:", apiKey);

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;

  try {
    const res = await fetch(`${baseUrl}/transfers/${id}`, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        "access-token": keyHeader,
        "User-Agent": userAgent,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      await logConciliacaoErro(`Erro ao cancelar transferência: ${errorBody}`);
      return NextResponse.json(
        { error: "Falha ao cancelar transferência" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "cancelado" });
  } catch (err) {
    await logConciliacaoErro(
      `Erro inesperado ao cancelar transferência: ${String(err)}`,
    );
    return NextResponse.json(
      { error: "Erro ao cancelar transferência" },
      { status: 500 },
    );
  }
}
