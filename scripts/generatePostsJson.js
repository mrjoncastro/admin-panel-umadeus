const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(process.cwd(), "posts");
const publicDir = path.join(process.cwd(), "public");
const outputPath = path.join(publicDir, "posts.json");

function getPosts() {
  const files = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      title: data.title || "Sem título",
      slug: filename.replace(/\.mdx$/, ""),
      summary: data.summary || "",
      date: data.date || "",
      thumbnail: data.thumbnail
        ? `/uploads/${path.basename(data.thumbnail)}`
        : null,
      category: data.category || null,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

try {
  const posts = getPosts();

  // Garante que a pasta public existe
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Substitui o arquivo se já existir
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
  console.log(`✅ ${posts.length} posts salvos em /public/posts.json`);
} catch (err) {
  console.error("❌ Erro ao gerar posts.json:", err);
}
