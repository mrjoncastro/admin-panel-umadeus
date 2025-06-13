import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { pb } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  let apiKey = "";

  try {
    const host = req.headers.get("host")?.split(":")[0] ?? "";
    console.log("🌐 Host capturado:", host);

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
      console.log("📄 Registro do cliente:", clienteRecord);

      if (clienteRecord?.asaas_api_key) {
        apiKey = clienteRecord.asaas_api_key;
        console.log("🔑 Chave Asaas capturada do cliente:", apiKey);
      } else {
        console.warn("⚠️ Cliente encontrado, mas sem chave Asaas.");
      }
    } else {
      console.warn("⚠️ Host não identificado na requisição.");
    }
  } catch (err) {
    console.error("❌ Erro ao obter chave Asaas:", err);
  }

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 }
    );
  }

  const keyHeader = apiKey.startsWith("$") ? apiKey : `$${apiKey}`;
  console.log("🔑 ASAAS_API_URL:", baseUrl);
  console.log("🔑 ASAAS_API_KEY final:", keyHeader);

  try {
    const res = await fetch(`${baseUrl}/finance/balance`, {
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
