/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import CarrinhoPage from '@/app/loja/carrinho/page'
import CartPreview from '@/components/molecules/CartPreview'
import { CartProvider } from '@/lib/context/CartContext'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ isLoggedIn: true }),
}))

function renderWithItem() {
  const preco_bruto = 50
  const preco = 50
  const item = {
    id: '1',
    nome: 'Prod',
    preco,
    preco_bruto,
    imagens: ['/img.jpg'],
    slug: 'prod',
    quantidade: 1,
    variationId: '1',
  }
  window.localStorage.setItem('carrinho', JSON.stringify([item]))
  return { preco_bruto }
}

function renderWithItems() {
  const item1 = {
    id: '1',
    nome: 'Prod1',
    preco: 10,
    preco_bruto: 10,
    imagens: ['/img1.jpg'],
    slug: 'prod1',
    quantidade: 1,
    variationId: '1',
  }
  const item2 = {
    id: '2',
    nome: 'Prod2',
    preco: 20,
    preco_bruto: 20,
    imagens: ['/img2.jpg'],
    slug: 'prod2',
    quantidade: 2,
    variationId: '2',
  }
  window.localStorage.setItem('carrinho', JSON.stringify([item1, item2]))
  return { item1, item2 }
}

describe('CarrinhoPage', () => {
  it('mostra valor bruto do item', async () => {
    const { preco_bruto } = renderWithItem()
    const gross = preco_bruto
    render(
      <CartProvider>
        <CarrinhoPage />
      </CartProvider>,
    )
    await screen.findByText('Carrinho')
    expect(
      screen.getAllByText(`R$ ${gross.toFixed(2).replace('.', ',')}`).length,
    ).toBeGreaterThan(0)
  })
})

describe('CartPreview', () => {
  it('mostra total bruto calculado', () => {
    const { preco_bruto } = renderWithItem()
    const gross = preco_bruto
    render(
      <CartProvider>
        <CartPreview />
      </CartProvider>,
    )
    expect(
      screen.getByText(`R$ ${gross.toFixed(2).replace('.', ',')}`),
    ).toBeInTheDocument()
  })

  it('mostra valor bruto de cada item', () => {
    const { item1, item2 } = renderWithItems()
    const gross1 = item1.preco_bruto * item1.quantidade
    const gross2 = item2.preco_bruto * item2.quantidade
    render(
      <CartProvider>
        <CartPreview />
      </CartProvider>,
    )
    expect(
      screen.getAllByText(
        new RegExp(`R\\$\\s*${gross1.toFixed(2).replace('.', ',')}`),
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(
        new RegExp(`R\\$\\s*${gross2.toFixed(2).replace('.', ',')}`),
      ).length,
    ).toBeGreaterThan(0)
  })
})
