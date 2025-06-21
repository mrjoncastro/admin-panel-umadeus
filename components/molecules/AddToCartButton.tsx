'use client'
import { useCart } from '@/lib/context/CartContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Produto } from '@/types'
import { ShoppingCart } from 'lucide-react'
import useInscricoes from '@/lib/hooks/useInscricoes'

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { addItem } = useCart()
  const { showSuccess } = useToast()
  const { inscricoes } = useInscricoes()

  const aprovado = inscricoes.some(
    (i) => i.evento === produto.evento_id && i.status === 'confirmado',
  )

  const disabled = produto.requer_inscricao_aprovada && !aprovado

  const handleClick = () => {
    if (disabled) return
    addItem(produto)
    showSuccess('Item adicionado ao carrinho!')
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="block w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart size={20} />
      {disabled ? ' Aguardando inscrição' : ' Adicionar ao Carrinho'}
    </button>
  )
}
