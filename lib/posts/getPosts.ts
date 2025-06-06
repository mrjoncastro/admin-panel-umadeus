import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export async function getPosts() {
  const files = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      title: data.title ?? "Sem título",
      slug: filename.replace(/\.mdx$/, ""),
      summary: data.summary ?? "",
      date: data.date ?? "",
      thumbnail: data.thumbnail ?? null,
      category: data.category ?? null,
    };
  });

  // Ordena por data decrescente
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
