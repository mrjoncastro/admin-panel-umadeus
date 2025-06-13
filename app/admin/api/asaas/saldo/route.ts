import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
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

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 }
    );
  }

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;

  try {
    const res = await fetch(`${baseUrl}/account/balance`, {
      headers: {
        accept: "application/json",
        "access-token": keyHeader,
        "User-Agent": "qg3",
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Erro ao consultar saldo Asaas:", errorBody);
      return NextResponse.json(
        { error: "Falha ao consultar saldo" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro inesperado ao consultar saldo:", err);
    return NextResponse.json(
      { error: "Erro ao consultar saldo" },
      { status: 500 }
    );
  }
}
