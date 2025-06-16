import { NextRequest, NextResponse } from "next/server";
import { logConciliacaoErro } from "@/lib/server/logger";
import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title")?.toString() || "";
    const summary = formData.get("summary")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const date = formData.get("date")?.toString() || new Date().toISOString();
    const thumbnail = formData.get("thumbnail")?.toString() || "";
    const keywords = formData.get("keywords")?.toString() || "";

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios." },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    const pb = createPocketBase();
    const tenantId = await getTenantFromHost();

    const data = {
      title,
      slug,
      summary,
      category,
      content,
      date,
      thumbnail,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      cliente: tenantId,
    };

    try {
      const existing = await pb
        .collection("posts")
        .getFirstListItem(`slug='${slug}' && cliente='${tenantId}'`);
      await pb.collection("posts").update(existing.id, data);
    } catch {
      await pb.collection("posts").create(data);
    }

    return NextResponse.json({ slug, thumbnail });
  } catch (err) {
    await logConciliacaoErro(`Erro ao salvar post: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro ao salvar post." },
      { status: 500 }
    );
  }
}
