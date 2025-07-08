/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import CheckoutPage from '@/app/loja/checkout/page'

vi.mock('@/lib/context/CartContext', () => ({
  useCart: () => ({
    itens: [
      {
        id: 'p1',
        variationId: 'p1-',
        nome: 'Produto',
        preco: 10,
        quantidade: 1,
        slug: 'prod1',
        generos: '',
        tamanhos: '',
        cores: '',
      },
    ],
    clearCart: vi.fn(),
  }),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({
    isLoggedIn: true,
    user: { id: 'u1', nome: 'User' },
    tenantId: 't1',
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}))

describe('CheckoutContent', () => {
  it('nao exibe campo de parcelas', () => {
    render(<CheckoutPage />)
    expect(screen.queryByLabelText('Parcelas')).toBeNull()
  })
})
