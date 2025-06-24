'use client'
import Image from 'next/image'
import type { Produto } from '@/types'

export default function ProdutoCardPreview({ produto }: { produto: Produto }) {
  const imgSrc = produto.imagem || (Array.isArray(produto.imagens) ? produto.imagens[0] : '')
  return (
    <div className="rounded-2xl bg-white shadow-sm p-4 flex flex-col items-center">
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={produto.nome}
          width={300}
          height={300}
          className="w-full h-64 object-cover rounded-xl mb-4 border border-[var(--accent-900)]/10"
        />
      )}
      <h3 className="font-medium text-lg mb-2">{produto.nome}</h3>
      <span className="font-bold text-[var(--accent)] text-lg mb-4">
        R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
      </span>
    </div>
  )
}
