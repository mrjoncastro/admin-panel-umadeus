'use client'
import { useCart } from '@/lib/context/CartContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Produto, Pedido } from '@/types'
import { ShoppingCart } from 'lucide-react'
import useInscricoes from '@/lib/hooks/useInscricoes'
import Link from 'next/link'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useState } from 'react'
import AuthModal from '@/components/organisms/AuthModal'

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart()
  const { showSuccess, showError } = useToast()
  const { inscricoes } = useInscricoes()
  const { isLoggedIn } = useAuthContext()
  const [authOpen, setAuthOpen] = useState(false)

  const inscricao = inscricoes.find((i) => i.evento === produto.evento_id)
  const pago = inscricao?.status === 'confirmado'
  const aprovado = Boolean(inscricao?.aprovada || pago)

  // Fluxo para produtos que exigem inscrição aprovada
  if (produto.requer_inscricao_aprovada && produto.evento_id) {
    if (!inscricao) {
      return (
        <Link
          href={`/loja/eventos/${produto.evento_id}`}
          className="btn btn-primary block w-full"
        >
          Fazer Inscrição
        </Link>
      )
    }
    if (!aprovado) {
      return (
        <button className="btn btn-primary block w-full" disabled>
          Aguardando aprovação
        </button>
      )
    }
    if (pago) {
      return (
        <button className="btn btn-primary block w-full" disabled>
          Produto já adquirido
        </button>
      )
    }

    const handlePagar = () => {
      const pedido = inscricao?.expand?.pedido as Pedido | undefined

      if (!pedido || !pedido.link_pagamento) {
        showError('Link de pagamento não disponível')
        return
      }

      // Redireciona para o link existente, sem criar novo
      window.location.href = pedido.link_pagamento
    }

    return (
      <button onClick={handlePagar} className="btn btn-primary block w-full">
        Pagar Inscrição
      </button>
    )
  }

  // Fluxo padrão de carrinho
  const handleClick = () => {
    if (!isLoggedIn) {
      setAuthOpen(true)
      return
    }
    addItem(produto)
    showSuccess('Item adicionado ao carrinho!')
  }

  return (
    <>
      <button onClick={handleClick} className="block w-full btn btn-primary">
        <ShoppingCart size={20} /> Adicionar ao Carrinho
      </button>
      {authOpen && (
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      )}
    </>
  )
}
