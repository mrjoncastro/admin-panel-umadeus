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
  const { showSuccess } = useToast()
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

    const handlePagar = () => {
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
