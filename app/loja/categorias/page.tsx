export default function CategoriasPage() {
  const categorias = [
    { slug: 'camisetas', nome: 'Camisetas' },
    { slug: 'acessorios', nome: 'Acessórios' },
  ];

  return (
    <main className="p-8 text-platinum font-sans">
      <h1 className="text-3xl font-bold mb-6">Categorias</h1>
      <ul className="space-y-4">
        {categorias.map((c) => (
          <li key={c.slug}>
            <a href={`/loja/categorias/${c.slug}`} className="text-yellow-400 hover:underline">
              {c.nome}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
