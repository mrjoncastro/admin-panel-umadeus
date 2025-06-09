"use client";

import { useCart } from "@/lib/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";

export default function CarrinhoPage() {
  const { itens, removeItem, clearCart } = useCart();
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  function handleCheckout() {
    if (!isLoggedIn) setShowAuth(true);
    else router.push("/loja/checkout");
  }

  if (itens.length === 0) {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Carrinho</h1>
      <ul className="space-y-4">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            {item.imagens?.[0] && (
              <Image
                src={item.imagens[0]}
                alt={item.nome}
                width={80}
                height={80}
                className="rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium">{item.nome}</p>
              <p className="text-sm">Qtd: {item.quantidade}</p>
            </div>
            <div className="font-semibold">
              R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="ml-2 text-sm text-red-500 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center font-semibold mt-4">
        <span>Total:</span>
        <span>R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={clearCart}
          className="btn btn-secondary"
        >
          Limpar carrinho
        </button>
        <button onClick={handleCheckout} className="btn btn-primary">
          Finalizar compra
        </button>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}

