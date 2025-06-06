import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { requireRole } from "@/lib/apiAuth";

const postsDir = path.join(process.cwd(), "posts");
const publicDir = path.join(process.cwd(), "public");
const uploadsDir = path.join(publicDir, "uploads");
const postsJson = path.join(publicDir, "posts.json");

function savePostsJson() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      title: data.title || "",
      date: data.date || "",
      summary: data.summary || "",
      category: data.category || "",
      author: data.author || "",
      thumbnail: data.thumbnail || null,
    };
  });
  const sorted = posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  fs.writeFileSync(postsJson, JSON.stringify(sorted, null, 2));
  return sorted;
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = params;
  const formData = await req.formData();
  const title = String(formData.get("title"));
  const date = String(formData.get("date"));
  const summary = String(formData.get("summary"));
  const category = String(formData.get("category"));
  const author = String(formData.get("author"));
  const content = String(formData.get("content"));
  const file = formData.get("file");

  let thumbnailPath = String(formData.get("currentThumb"));
  if (file && file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, file.name);
    fs.writeFileSync(filePath, buffer);
    thumbnailPath = `/uploads/${file.name}`;
  }

  const mdxPath = path.join(postsDir, `${slug}.mdx`);
  const mdx = `---\ntitle: ${title}\ndate: ${date}\ncategory: ${category}\nauthor: ${author}\nsummary: ${summary}\nthumbnail: ${thumbnailPath}\n---\n\n${content}\n`;
  fs.writeFileSync(mdxPath, mdx);

  const posts = savePostsJson();
  return NextResponse.json(posts);
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const auth = requireRole(req, "coordenador");
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = params;
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const posts = savePostsJson();
  return NextResponse.json(posts);
}
