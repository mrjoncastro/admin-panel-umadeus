import createPocketBase from "@/lib/pocketbase";

export const dynamic = "force-dynamic";

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default async function CategoriasPage() {
  const pb = createPocketBase();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const categorias: Categoria[] = await pb
    .collection("categorias")
    .getFullList({
      sort: "nome",
      ...(tenantId ? { filter: `cliente='${tenantId}'` } : {}),
    });

  return (
    <main className="p-8 text-platinum font-sans">
      <h1 className="text-3xl font-bold mb-6">Categorias</h1>
      <ul className="space-y-4">
        {categorias.map((c) => (
          <li key={c.id}>
            <a
              href={`/loja/categorias/${c.slug}`}
              className="text-yellow-400 hover:underline"
            >
              {c.nome}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
