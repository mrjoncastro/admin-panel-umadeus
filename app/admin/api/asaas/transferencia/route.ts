import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/apiAuth";
import createPocketBase from "@/lib/pocketbase";

async function getApiInfo(
  req: NextRequest,
  pb: ReturnType<typeof createPocketBase>,
) {
  let apiKey = process.env.ASAAS_API_KEY || "";
  let userAgent = "qg3";
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
        userAgent = clienteRecord?.nome || userAgent;
      }
    }
  } catch {
    /* ignore */
  }
  return { apiKey, userAgent };
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  const { apiKey, userAgent } = await getApiInfo(req, pb);

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 }
    );
  }

  console.log("🔑 API Key utilizada:", apiKey);

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
      console.error("Erro ao criar transferência:", errorBody);
      return NextResponse.json(
        { error: "Falha ao criar transferência" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Erro inesperado ao criar transferência:", err);
    return NextResponse.json(
      { error: "Erro ao criar transferência" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { pb } = auth;
  const baseUrl = process.env.ASAAS_API_URL;
  const { apiKey, userAgent } = await getApiInfo(req, pb);

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Asaas não configurado" },
      { status: 500 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Id obrigatório" }, { status: 400 });
  }

  console.log("🔑 API Key utilizada:", apiKey);

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
      console.error("Erro ao cancelar transferência:", errorBody);
      return NextResponse.json(
        { error: "Falha ao cancelar transferência" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "cancelado" });
  } catch (err) {
    console.error("Erro inesperado ao cancelar transferência:", err);
    return NextResponse.json(
      { error: "Erro ao cancelar transferência" },
      { status: 500 }
    );
  }
}
