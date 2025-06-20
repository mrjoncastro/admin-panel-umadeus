'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/context/CartContext'
import { calculateGross } from '@/lib/asaasFees'

export default function CartPreview() {
  const { itens } = useCart()
  const total = itens.reduce(
    (sum, i) => sum + calculateGross(i.preco, 'pix', 1).gross * i.quantidade,
    0,
  )

  if (itens.length === 0) {
    return (
      <div className="card bg-[var(--background)] text-sm shadow-lg w-64">
        <p className="text-center">Seu carrinho está vazio</p>
      </div>
    )
  }

  return (
    <div className="card bg-[var(--background)] text-sm shadow-lg w-64">
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-48 overflow-y-auto">
        {itens.map((item) => (
          <li key={item.variationId} className="flex items-center gap-2 py-2">
            {item.imagens?.[0] && (
              <Image
                src={item.imagens[0]}
                alt={item.nome}
                width={32}
                height={32}
                className="rounded"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-xs">{item.nome}</p>
              <p className="text-xs text-neutral-900 dark:text-neutral-400">
                x{item.quantidade}
              </p>
            </div>
            <span className="text-xs text-neutral-900 font-semibold">
              R$
              {(calculateGross(item.preco, 'pix', 1).gross * item.quantidade)
                .toFixed(2)
                .replace('.', ',')}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700 mt-2">
        <span className="font-semibold text-neutral-900 text-sm">Total:</span>
        <span className="font-semibold text-neutral-900 text-sm">
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>
      <Link
        href="/loja/carrinho"
        className="mt-3 btn btn-primary w-full text-center"
      >
        Ver Carrinho
      </Link>
    </div>
  )
}
