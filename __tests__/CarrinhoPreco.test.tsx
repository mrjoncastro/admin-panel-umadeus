/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import CarrinhoPage from '@/app/loja/carrinho/page'
import CartPreview from '@/components/molecules/CartPreview'
import { CartProvider } from '@/lib/context/CartContext'
import { calculateGross } from '@/lib/asaasFees'

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
  const preco = 50
  const item = {
    id: '1',
    nome: 'Prod',
    preco,
    imagens: ['/img.jpg'],
    slug: 'prod',
    quantidade: 1,
    variationId: '1',
  }
  window.localStorage.setItem('carrinho', JSON.stringify([item]))
  return { preco }
}

function renderWithItems() {
  const item1 = {
    id: '1',
    nome: 'Prod1',
    preco: 10,
    imagens: ['/img1.jpg'],
    slug: 'prod1',
    quantidade: 1,
    variationId: '1',
  }
  const item2 = {
    id: '2',
    nome: 'Prod2',
    preco: 20,
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
    const { preco } = renderWithItem()
    const gross = calculateGross(preco, 'pix', 1).gross
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
    const { preco } = renderWithItem()
    const gross = calculateGross(preco, 'pix', 1).gross
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
    const gross1 =
      calculateGross(item1.preco, 'pix', 1).gross * item1.quantidade
    const gross2 =
      calculateGross(item2.preco, 'pix', 1).gross * item2.quantidade
    render(
      <CartProvider>
        <CartPreview />
      </CartProvider>,
    )
    expect(
      screen.getAllByText(new RegExp(`R\\$\\s*${gross1
        .toFixed(2)
        .replace('.', ',')}`)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(new RegExp(`R\\$\\s*${gross2
        .toFixed(2)
        .replace('.', ',')}`)).length,
    ).toBeGreaterThan(0)
  })
})
