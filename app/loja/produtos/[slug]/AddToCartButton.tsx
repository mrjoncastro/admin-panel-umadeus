"use client";
import { useCart } from "@/lib/context/CartContext";
import { useToast } from "@/lib/context/ToastContext";
import type { Produto } from "@/types";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const handleClick = () => {
    addItem(produto);
    showSuccess("Item adicionado ao carrinho!");
  };

  return (
    <button onClick={handleClick} className="block w-full btn btn-primary">
      <ShoppingCart size={20} /> Adicionar ao Carrinho
    </button>
  );
}
