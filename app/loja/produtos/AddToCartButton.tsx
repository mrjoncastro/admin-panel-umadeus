"use client";
import { useCart } from "@/lib/context/CartContext";
import usePocketBase from "@/lib/hooks/usePocketBase";
import type { Produto } from "@/types";

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const pb = usePocketBase();

  function handleClick() {
    const produtoComUrls = {
      ...produto,
      imagens: (produto.imagens || []).map((img) =>
        img.startsWith("http") || img.startsWith("/")
          ? img
          : pb.files.getUrl(produto as Record<string, unknown>, img)
      ),
    };
    addItem(produtoComUrls);
  }
  return (
    <button
      onClick={handleClick}
      className="mt-2 w-full btn btn-secondary"
    >
      Adicionar
    </button>
  );
}

