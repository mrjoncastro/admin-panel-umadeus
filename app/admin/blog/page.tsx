"use client";
import { useEffect, useState } from "react";

interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  author: string;
  thumbnail?: string | null;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [filters, setFilters] = useState({ categoria: "", autor: "", data: "" });

  useEffect(() => {
    fetch("/admin/api/posts")
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => {});
  }, []);

  const filtered = posts.filter((p) => {
    const f1 =
      !filters.categoria || p.category?.toLowerCase().includes(filters.categoria.toLowerCase());
    const f2 =
      !filters.autor || p.author?.toLowerCase().includes(filters.autor.toLowerCase());
    const f3 = !filters.data || p.date.startsWith(filters.data);
    return f1 && f2 && f3;
  });

  const handleEdit = (post: Post) => {
    setEditing(post);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Blog</h1>
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Categoria"
          value={filters.categoria}
          onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Autor"
          value={filters.autor}
          onChange={(e) => setFilters({ ...filters, autor: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filters.data}
          onChange={(e) => setFilters({ ...filters, data: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Novo Post
        </button>
      </div>
      <table className="w-full text-left border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Título</th>
            <th className="p-2">Categoria</th>
            <th className="p-2">Autor</th>
            <th className="p-2">Data</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((post) => (
            <tr key={post.slug} className="border-t">
              <td className="p-2">{post.title}</td>
              <td className="p-2">{post.category}</td>
              <td className="p-2">{post.author}</td>
              <td className="p-2">{post.date}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <PostForm
          post={editing}
          onClose={() => setShowForm(false)}
          onSaved={setPosts}
        />
      )}
    </div>
  );
}

function PostForm({
  post,
  onClose,
  onSaved,
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: (posts: Post[]) => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [summary, setSummary] = useState(post?.summary || "");
  const [date, setDate] = useState(post?.date || "");
  const [category, setCategory] = useState(post?.category || "");
  const [author, setAuthor] = useState(post?.author || "");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(post?.thumbnail || "");

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("summary", summary);
    formData.append("date", date);
    formData.append("category", category);
    formData.append("author", author);
    formData.append("content", content);
    if (file) formData.append("file", file);
    if (post?.thumbnail && !file) formData.append("currentThumb", post.thumbnail);

    const url = post ? `/admin/api/posts/${post.slug}` : "/admin/api/posts";
    const method = post ? "PUT" : "POST";
    const res = await fetch(url, { method, body: formData });
    if (res.ok) {
      const data = await res.json();
      onSaved(data);
      onClose();
    } else {
      alert("Erro ao salvar post");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-xl space-y-3 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-bold mb-2">{post ? "Editar" : "Novo"} Post</h2>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Resumo"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Autor"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Conteúdo MDX"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full rounded h-40"
        />
        <input type="file" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        {preview && <img src={preview} alt="preview" className="max-h-40" />}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
