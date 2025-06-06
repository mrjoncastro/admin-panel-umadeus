import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostData {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  date: string; // formato ISO
}

function parseToISO(dateString: string): string {
  // Suporte para "dd/mm/yyyy, HH:mm:ss"
  if (dateString.includes("/")) {
    const [day, month, yearAndTime] = dateString.split("/");
    const [year, time] = yearAndTime.split(", ");
    const parsed = new Date(`${month}/${day}/${year} ${time}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }

  // Fallback para ISO direto
  const fallback = new Date(dateString);
  if (!isNaN(fallback.getTime())) return fallback.toISOString();

  return "";
}

export function getRelatedPosts(
  currentSlug: string,
  currentCategory: string
): {
  nextPost: PostData | null;
  suggestions: PostData[];
} {
  const postsDir = "posts";
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

  const allPosts: PostData[] = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(postsDir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = matter(raw);
      const isoDate = parseToISO(data.date);

      if (!isoDate) return null;

      return {
        slug,
        title: data.title,
        summary: data.summary,
        thumbnail: data.thumbnail || "/img/og-default.jpg", // 🔒 fallback garantido
        category: data.category,
        date: isoDate,
      };
    })
    .filter(Boolean) as PostData[];

  // Tenta filtrar pela mesma categoria
  let posts = allPosts.filter((p) => p.category === currentCategory);

  // Se não houver outros na mesma categoria, usa todos
  if (posts.length < 2) {
    posts = allPosts;
  }

  // Ordenação por data (asc)
  const sorted = posts.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const currentIndex = sorted.findIndex((p) => p.slug === currentSlug);
  const nextPost = sorted[currentIndex + 1] || null;

  const suggestions = sorted.filter((p) => p.slug !== currentSlug).slice(0, 3);

  return { nextPost, suggestions };
}
