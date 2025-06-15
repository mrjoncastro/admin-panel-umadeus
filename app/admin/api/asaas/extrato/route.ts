import { NextRequest, NextResponse } from "next/server";
import { requireClienteFromHost } from "@/lib/clienteAuth";

export async function GET(req: NextRequest) {
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

  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  console.log("\ud83d\udd11 API Key utilizada:", apiKey);

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;
  const url = new URL(`${baseUrl}/finance/transactions`);
  if (start) url.searchParams.set("startDate", start);
  if (end) url.searchParams.set("endDate", end);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        "access-token": keyHeader,
        "User-Agent": userAgent,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Erro ao consultar extrato:", errorBody);
      return NextResponse.json(
        { error: "Falha ao consultar extrato" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro inesperado ao consultar extrato:", err);
    return NextResponse.json(
      { error: "Erro ao consultar extrato" },
      { status: 500 },
    );
  }
}
