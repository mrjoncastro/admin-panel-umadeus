"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Produto } from "@/types";

type CartItem = Produto & { quantidade: number };

type CartContextType = {
  itens: CartItem[];
  addItem: (produto: Produto) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  itens: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("carrinho");
      if (raw) setItens(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(itens));
  }, [itens]);

  const addItem = useCallback((produto: Produto) => {
    setItens((curr) => {
      const existing = curr.find((p) => p.id === produto.id);
      if (existing) {
        return curr.map((p) =>
          p.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }
      return [...curr, { ...produto, quantidade: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItens((curr) => curr.filter((p) => p.id !== id));
  }, []);

  const clearCart = useCallback(() => setItens([]), []);

  return (
    <CartContext.Provider value={{ itens, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

