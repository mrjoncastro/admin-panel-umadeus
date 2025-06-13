import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import createPocketBase from "@/lib/pocketbase";

async function getApiKey(req: NextRequest, pb: ReturnType<typeof createPocketBase>) {
  let apiKey = process.env.ASAAS_API_KEY || "";
  try {
    const host = req.headers.get("host")?.split(":" )[0] ?? "";
    if (!pb.authStore.isValid) {
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL!,
        process.env.PB_ADMIN_PASSWORD!
      );
    }
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
  return apiKey;
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  const apiKey = await getApiKey(req, pb);

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 }
    );
  }

  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;
  const url = new URL(`${baseUrl}/financialTransactions`);
  if (start) url.searchParams.set("startDate", start);
  if (end) url.searchParams.set("endDate", end);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        "access-token": keyHeader,
        "User-Agent": "qg3",
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Erro ao consultar extrato:", errorBody);
      return NextResponse.json(
        { error: "Falha ao consultar extrato" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro inesperado ao consultar extrato:", err);
    return NextResponse.json(
      { error: "Erro ao consultar extrato" },
      { status: 500 }
    );
  }
}
