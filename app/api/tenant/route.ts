import { NextResponse } from "next/server";
import { getTenantFromHost } from "@/lib/getTenantFromHost";

export async function GET() {
  try {
    const tenantId = await getTenantFromHost();
    if (!tenantId) {
      return NextResponse.json(
        { error: "Domínio não configurado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ tenantId }, { status: 200 });
  } catch {
    return NextResponse.json({ tenantId: null }, { status: 200 });
  }
}
