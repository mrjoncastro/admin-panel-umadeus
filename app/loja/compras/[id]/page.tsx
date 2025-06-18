"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { Compra } from "@/types";

function formatCurrency(v: number) {
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

function formatEndereco(endereco: Record<string, unknown> | undefined) {
  if (!endereco) return "-";
  const { endereco: rua, numero, cidade, estado, cep } = endereco as Record<string, string>;
  return [rua, numero, cidade, estado, cep].filter(Boolean).join(", ");
}

export default function DetalheCompraUsuario() {
  const { id } = useParams<{ id: string }>();
  const { pb, authChecked } = useAuthGuard(["usuario"]);
  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authChecked) return;
    pb.collection("compras")
      .getOne<Compra>(id)
      .then((data) => {
        const itens = Array.isArray(data.itens)
          ? data.itens.map((i) => {
              if ("id" in i || "sku" in i) return i;
              return {
                ...i,
                _uuid: globalThis.crypto?.randomUUID
                  ? globalThis.crypto.randomUUID()
                  : Math.random().toString(36).slice(2),
              };
            })
          : [];
        setCompra({ ...data, itens });
      })
      .catch(() => setCompra(null))
      .finally(() => setLoading(false));
  }, [authChecked, pb, id]);

  if (!authChecked) return null;

  if (loading) {
    return <LoadingOverlay show={true} text="Carregando compra..." />;
  }

  if (!compra) {
    return <p className="p-6 text-center text-sm">Compra não encontrada.</p>;
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <h2 className="text-xl font-bold">Detalhes da Compra</h2>
      <p>
        <strong>Valor Total:</strong> {formatCurrency(Number(compra.valor_total))}
      </p>
      <p>
        <strong>Status:</strong> {compra.status}
      </p>
      <p>
        <strong>Método de Pagamento:</strong> {compra.metodo_pagamento}
      </p>
      <p>
        <strong>Endereço:</strong> {formatEndereco(compra.endereco_entrega)}
      </p>
      <div>
        <h3 className="font-semibold mt-4 mb-2">Itens</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {compra.itens.map((item) => {
            const key =
              (item as Record<string, unknown>).id ??
              (item as Record<string, unknown>).sku ??
              (item as Record<string, unknown>)._uuid;
            return <li key={String(key)}>{JSON.stringify(item)}</li>;
          })}
        </ul>
      </div>
    </main>
  );
}
