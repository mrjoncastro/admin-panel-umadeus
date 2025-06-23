'use client'
import { useCart } from '@/lib/context/CartContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Produto } from '@/types'
import { ShoppingCart } from 'lucide-react'
import useInscricoes from '@/lib/hooks/useInscricoes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart()
  const { showSuccess, showError } = useToast()
  const { inscricoes } = useInscricoes()
  const router = useRouter()

  const inscricao = inscricoes.find((i) => i.evento === produto.evento_id)
  const pago = inscricao?.status === 'confirmado'
  const aprovado = Boolean(inscricao?.aprovada || pago)

  if (produto.requer_inscricao_aprovada && produto.evento_id) {
    if (!inscricao) {
      return (
        <Link href={`/loja/eventos/${produto.evento_id}`} className="btn btn-primary block w-full">
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

    const handlePagar = async () => {
      const pedido = inscricao?.expand?.pedido as
        | {
            id: string
            produto?: string | string[]
            link_pagamento?: string
            status?: string
          }
        | undefined

      const prodPedido = Array.isArray(pedido?.produto)
        ? pedido?.produto[0]
        : pedido?.produto

      if (pedido && pedido.status === 'pendente') {
        if (prodPedido === produto.id && pedido.link_pagamento) {
          window.location.href = pedido.link_pagamento
          return
        }

        try {
          await fetch(`/api/pedidos/${pedido.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ produto: produto.id }),
          })

          const res = await fetch('/api/asaas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              pedidoId: pedido.id,
              valorBruto: produto.preco,
            }),
          })

          const data = await res.json()

          if (res.ok && data.url) {
            window.location.href = data.url
            return
          }
        } catch {
          showError('Erro ao gerar pagamento')
          return
        }
      }

      addItem(produto)
      router.push('/loja/checkout')
    }

    return (
      <button onClick={handlePagar} className="btn btn-primary block w-full">
        Pagar Inscrição
      </button>
    )
  }

  const handleClick = () => {
    addItem(produto)
    showSuccess('Item adicionado ao carrinho!')
  }

  return (
    <button
      onClick={handleClick}
      className="block w-full btn btn-primary"
    >
      <ShoppingCart size={20} /> Adicionar ao Carrinho
    </button>
  )
}
