/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProdutosFiltrados from '@/components/organisms/ProdutosFiltrados'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt} />
  },
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

describe('ProdutosFiltrados', () => {
  it('exibe valor bruto calculado', () => {
    const precoBruto = 100
    render(
      <ProdutosFiltrados
        produtos={[
          {
            id: '1',
            nome: 'Prod',
            preco: 80,
            preco_bruto: precoBruto,
            imagens: ['/img.jpg'],
            slug: 'prod',
          },
        ]}
      />,
    )
    expect(
      screen.getByText(`R$ ${precoBruto.toFixed(2).replace('.', ',')}`),
    ).toBeInTheDocument()
  })
})
