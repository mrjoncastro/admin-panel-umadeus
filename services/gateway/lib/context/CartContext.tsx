'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { Produto } from '@/types'

function makeVariationId(produto: Produto) {
  const genero = Array.isArray(produto.generos)
    ? produto.generos[0] || ''
    : typeof produto.generos === 'string'
      ? produto.generos
      : ''
  const tamanho = Array.isArray(produto.tamanhos)
    ? produto.tamanhos[0] || ''
    : typeof produto.tamanhos === 'string'
      ? produto.tamanhos
      : ''
  const cor = Array.isArray(produto.cores)
    ? produto.cores[0] || ''
    : typeof produto.cores === 'string'
      ? produto.cores
      : ''
  return `${produto.id}-${genero}-${tamanho}-${cor}`
}

type CartItem = Produto & { quantidade: number; variationId: string }

type CartContextType = {
  itens: CartItem[]
  addItem: (produto: Produto) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  itens: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('carrinho')
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        const normalized = parsed.map((p) => ({
          ...p,
          variationId: p.variationId ?? makeVariationId(p),
        }))
        setItens(normalized)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(itens))
  }, [itens])

  const addItem = useCallback((produto: Produto) => {
    setItens((curr) => {
      const variationId = makeVariationId(produto)
      const existing = curr.find((p) => p.variationId === variationId)
      if (existing) {
        return curr.map((p) =>
          p.variationId === variationId
            ? { ...p, quantidade: p.quantidade + 1 }
            : p,
        )
      }
      return [...curr, { ...produto, quantidade: 1, variationId }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItens((curr) => curr.filter((p) => p.variationId !== id))
  }, [])

  const clearCart = useCallback(() => setItens([]), [])

  return (
    <CartContext.Provider value={{ itens, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
