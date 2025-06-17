import { NextRequest, NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import type { Produto } from "@/types";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();
  const slug = params.slug;
  const filter = tenantId ? `slug = '${slug}' && cliente='${tenantId}'` : `slug = '${slug}'`;
  try {
    const p = await pb.collection("produtos").getFirstListItem<Produto>(filter);
    const imagens = Array.isArray(p.imagens)
      ? p.imagens.map((img) => pb.files.getURL(p, img))
      : Object.fromEntries(
          Object.entries(p.imagens as Record<string, string[]>).map(([g, arr]) => [
            g,
            arr.map((img) => pb.files.getURL(p, img)),
          ])
        );
    return NextResponse.json({ ...p, imagens });
  } catch {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
}
