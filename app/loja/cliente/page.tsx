export default function AreaCliente() {
  const pedidos = [
    { id: '1', status: 'pago' },
    { id: '2', status: 'pendente' },
  ];

  return (
    <main className="p-8 text-platinum font-sans">
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>
      <ul className="space-y-2">
        {pedidos.map((p) => (
          <li key={p.id} className="border-b border-platinum/20 pb-2">
            Pedido #{p.id} - {p.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
