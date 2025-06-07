import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { writeFile, mkdir } from "fs/promises";
import matter from "gray-matter";

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
    const file = formData.get("thumbnail") as File | null;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios." },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    let thumbnailUrl = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      if (!fs.existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const ext = path.extname(file.name) || ".jpg";
      const filename = `${slug}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      thumbnailUrl = `/uploads/${filename}`;
    }

    const postsDir = path.join(process.cwd(), "posts");
    if (!fs.existsSync(postsDir)) {
      await mkdir(postsDir, { recursive: true });
    }

    const frontMatter = {
      title,
      summary,
      category,
      date: new Date().toISOString(),
      ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
    } as Record<string, string>;

    const mdxContent = `${matter.stringify(content, frontMatter)}\n`;
    const postPath = path.join(postsDir, `${slug}.mdx`);
    await writeFile(postPath, mdxContent, "utf8");

    return NextResponse.json({ slug, thumbnail: thumbnailUrl });
  } catch (err) {
    console.error("Erro ao salvar post:", err);
    return NextResponse.json(
      { error: "Erro ao salvar post." },
      { status: 500 }
    );
  }
}
