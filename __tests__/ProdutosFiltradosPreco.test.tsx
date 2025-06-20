/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProdutosFiltrados from '@/app/loja/produtos/ProdutosFiltrados'
import { calculateGross } from '@/lib/asaasFees'

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
    const precoBase = 100
    const { gross } = calculateGross(precoBase, 'pix', 1)
    render(
      <ProdutosFiltrados
        produtos={[
          {
            id: '1',
            nome: 'Prod',
            preco: precoBase,
            imagens: ['/img.jpg'],
            slug: 'prod',
          },
        ]}
      />,
    )
    expect(
      screen.getByText(`R$ ${gross.toFixed(2).replace('.', ',')}`),
    ).toBeInTheDocument()
  })
})
