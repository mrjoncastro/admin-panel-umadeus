"use client";
import { useCart } from "@/lib/context/CartContext";
import type { Produto } from "@/types";

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem(produto)}
      className="mt-2 w-full btn btn-secondary"
    >
      Adicionar
    </button>
  );
}

