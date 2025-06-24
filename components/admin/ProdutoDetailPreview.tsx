'use client'
import Image from 'next/image'
import type { Produto } from '@/types'

export default function ProdutoDetailPreview({ produto }: { produto: Produto }) {
  const imgSrc = produto.imagem || (Array.isArray(produto.imagens) ? produto.imagens[0] : '')
  return (
    <div className="space-y-4">
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={produto.nome}
          width={400}
          height={400}
          className="rounded-xl mx-auto"
        />
      )}
      <h2 className="text-2xl font-bold">{produto.nome}</h2>
      <p className="font-semibold">
        R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
      </p>
      {produto.descricao && (
        <p className="whitespace-pre-line">{produto.descricao}</p>
      )}
    </div>
  )
}
