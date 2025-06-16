import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { logConciliacaoErro } from "@/lib/server/logger";

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const slug = pathname.split("/").pop() ?? "";

  if (!slug) {
    return NextResponse.json(
      { error: "Slug ausente ou inválido." },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), "posts", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const keywords = Array.isArray(data.keywords)
      ? data.keywords.join(", ")
      : data.keywords ?? "";

    return NextResponse.json({
      title: data.title ?? "",
      summary: data.summary ?? "",
      category: data.category ?? "",
      date: data.date ?? "",
      thumbnail: data.thumbnail ?? data.headerImage ?? "",
      keywords,
      content,
    });
  } catch (err) {
    await logConciliacaoErro(`Erro ao carregar post: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro ao carregar post." },
      { status: 500 }
    );
  }
}

