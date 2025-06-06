interface Props {
  params: { slug: string };
}

export default function CategoriaDetalhe({ params }: Props) {
  return (
    <main className="p-8 text-platinum font-sans">
      <h1 className="text-3xl font-bold mb-6">Categoria: {params.slug}</h1>
      <p>Página em construção.</p>
    </main>
  );
}
