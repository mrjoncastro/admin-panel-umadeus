"use client";

import { useCart } from "@/lib/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { itens, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const pedidoId = searchParams.get("pedido") || Date.now().toString();
  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/api/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: total, pedidoId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error("Falha ao gerar link de pagamento");
      }
      clearCart();
      router.push(`/loja/sucesso?pedido=${pedidoId}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  if (itens.length === 0) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <ul className="space-y-4">
        {itens.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.nome} x{item.quantidade}
            </span>
            <span>
              R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-semibold">
        <span>Total:</span>
        <span>R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
      <div className="space-y-4 pt-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Endereço (opcional)</label>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Telefone (opcional)</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="input-base"
          />
        </div>
        <button
          disabled={loading}
          onClick={handleConfirm}
          className="btn btn-primary w-full"
        >
          {loading ? "Processando..." : "Confirmar"}
        </button>
      </div>
    </main>
  );
}
