// app/api/n8n/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const response = await fetch(
      "https://primary-production-481f.up.railway.app/webhook-test/umadeus-qg3",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Erro ao enviar dados para o n8n", detalhe: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    await logConciliacaoErro(`Erro na API /api/n8n: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro interno ao processar dados para o n8n." },
      { status: 500 }
    );
  }
}
