interface Params {
  slug: string;
}

export default async function CategoriaDetalhe({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  return (
    <main className="p-8 text-platinum font-sans">
      <h1 className="text-3xl font-bold mb-6">Categoria: {slug}</h1>
      <p>Página em construção.</p>
    </main>
  );
}
