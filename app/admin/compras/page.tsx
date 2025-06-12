"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { Compra } from "@/types";

export default function ComprasPage() {
  const { user, pb, authChecked } = useAuthGuard(["coordenador"]);

  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authChecked || !user) return;

    const fetchCompras = async () => {
      setLoading(true);
      try {
        const res = await pb.collection("compras").getList<Compra>(1, 50, {
          filter: `cliente = "${user.cliente}"`,
          sort: "-created",
        });
        setCompras(res.items);
      } catch (err) {
        console.error("Erro ao carregar compras", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, [pb, authChecked, user]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">403 - Acesso negado</h1>
      </div>
    );
  }

  if (loading) {
    return <p className="p-6 text-center text-sm">Carregando compras...</p>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="heading">Compras</h2>

      {compras.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma compra encontrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="table-base">
            <thead>
              <tr>
                <th>Valor</th>
                <th>Status</th>
                <th>Método</th>
                <th>Checkout</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id}>
                  <td>{Number(c.valor_total).toFixed(2)}</td>
                  <td className="capitalize">{c.status}</td>
                  <td>{c.metodo_pagamento}</td>
                  <td className="text-xs break-all">
                    {c.checkout_url ? (
                      <a
                        href={c.checkout_url}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
