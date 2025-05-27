// app/api/n8n/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const response = await fetch(
      "https://primary-production-481f.up.railway.app/webhook-test/8c403ec1-5dc5-4b12-a0c4-ce4c4b1cecb2",
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
    console.error("❌ Erro na API /api/n8n:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar dados para o n8n." },
      { status: 500 }
    );
  }
}
