import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { writeFile, mkdir } from "fs/promises";
import matter from "gray-matter";
import { logConciliacaoErro } from "@/lib/server/logger";

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

    const postsDir = path.join(process.cwd(), "posts");
    if (!fs.existsSync(postsDir)) {
      await mkdir(postsDir, { recursive: true });
    }

    const frontMatter = {
      title,
      summary,
      category,
      date,
      ...(thumbnail && { thumbnail }),
      ...(keywords && { keywords }),
    } as Record<string, string>;

    const mdxContent = `${matter.stringify(content, frontMatter)}\n`;
    const postPath = path.join(postsDir, `${slug}.mdx`);
    await writeFile(postPath, mdxContent, "utf8");

    return NextResponse.json({ slug, thumbnail });
  } catch (err) {
    await logConciliacaoErro(`Erro ao salvar post: ${String(err)}`);
    return NextResponse.json(
      { error: "Erro ao salvar post." },
      { status: 500 }
    );
  }
}
