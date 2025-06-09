"use client";
import { useCart } from "@/lib/context/CartContext";
import type { Produto } from "@/types";

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem(produto)}
      className="block w-full btn btn-primary"
    >
      Adicionar ao carrinho
    </button>
  );
}

