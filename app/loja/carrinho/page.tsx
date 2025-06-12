"use client";

import { useCart } from "@/lib/context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useState } from "react";
import { hexToPtName } from "@/utils/colorNamePt";

function formatCurrency(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export default function CarrinhoPage() {
  const { itens, removeItem, clearCart } = useCart();
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  function handleCheckout() {
    if (!isLoggedIn) {
      setShowPrompt(true);
      return;
    }
    router.push("/loja/checkout");
  }

  const goToSignup = () => {
    setShowPrompt(false);
    router.push("/login?view=signup&redirect=/loja/checkout");
  };
  const goToLogin = () => {
    setShowPrompt(false);
    router.push("/login?redirect=/loja/checkout");
  };

  if (itens.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-4 tracking-tight">
          Seu carrinho está vazio
        </h1>
        <button
          onClick={() => router.push("/loja")}
          className="text-sm underline mt-2"
        >
          Voltar à loja
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex justify-center items-center py-10">
      <div className="w-full max-w-3xl bg-neutral-50 rounded-2xl shadow-sm p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
          Carrinho
        </h1>
        <ul className="divide-y divide-gray-100 mb-6">
          {itens.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-5">
              {item.imagens?.[0] && (
                <Image
                  src={item.imagens[0]}
                  alt={item.nome}
                  width={72}
                  height={72}
                  className="rounded-xl object-cover border border-gray-200"
                  style={{ background: "#FAFAFA" }}
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-accent">{item.nome}</p>
                <p className="text-xs text-gray-400">
                  Modelo: {item.generos?.[0] || "-"} | Tamanho:{" "}
                  {item.tamanhos?.[0] || "-"} | Cor:{" "}
                  {item.cores?.[0] ? hexToPtName(item.cores[0]) : "-"}
                </p>
                <p className="text-xs text-gray-400">Qtd: {item.quantidade}</p>
              </div>
              <div className="font-semibold text-accent">
                {formatCurrency(item.preco * item.quantidade)}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-xs text-gray-400 hover:text-red-500 hover:underline transition"
                title="Remover item"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center border-t pt-4 font-semibold text-lg">
          <span>Total</span>
          <span className="tracking-wider">{formatCurrency(total)}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <button
            onClick={clearCart}
            className="py-2 px-5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 font-medium transition"
          >
            Limpar carrinho
          </button>
          <button
            onClick={handleCheckout}
            className="py-2 px-8 rounded-xl bg-primary-600 text-white font-medium text-accent tracking-wide transition hover:bg-primary-900 active:scale-95"
          >
            Finalizar compra
          </button>
          {showPrompt && !isLoggedIn && (
            <div className="text-sm text-center text-gray-600 mt-4 w-full">
              Para finalizar a compra, é preciso ter uma conta.{' '}
              <button onClick={goToSignup} className="underline">
                Criar conta
              </button>{' '}
              ou{' '}
              <button onClick={goToLogin} className="underline">
                fazer login
              </button>
              .
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

