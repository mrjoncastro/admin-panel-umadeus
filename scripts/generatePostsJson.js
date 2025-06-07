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

    // Aceita "thumbnail" ou "headerImage" no front matter
    const rawImage = data.thumbnail || data.headerImage;

    let image = null;
    if (rawImage) {
      // Mantém URLs externas; para caminhos locais usa /uploads
      image = /^https?:/.test(rawImage)
        ? rawImage
        : `/uploads/${path.basename(rawImage)}`;
    }

    // "keywords" pode ser string separada por vírgula ou array
    let keywords = [];
    if (Array.isArray(data.keywords)) {
      keywords = data.keywords;
    } else if (typeof data.keywords === "string") {
      keywords = data.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    }

    return {
      title: data.title || "Sem título",
      slug: filename.replace(/\.mdx$/, ""),
      summary: data.summary || "",
      date: data.date || "",
      thumbnail: image,
      category: data.category || null,
      keywords,
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
