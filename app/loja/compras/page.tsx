"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { Compra } from "@/types";

export default function MinhasComprasPage() {
  const { user, pb, authChecked } = useAuthGuard(["usuario"]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authChecked || !user) return;
    const token = pb.authStore.token;
    fetch("/loja/api/compras", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((res) => res.json())
      .then((data) => setCompras(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Erro ao carregar compras", err);
        setCompras([]);
      })
      .finally(() => setLoading(false));
  }, [authChecked, user, pb]);

  if (!authChecked) return null;

  if (loading) {
    return <LoadingOverlay show={true} text="Carregando compras..." />;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="heading">Minhas Compras</h2>
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
