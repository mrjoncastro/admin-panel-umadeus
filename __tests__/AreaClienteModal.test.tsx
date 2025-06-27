/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import AreaCliente from '@/app/loja/cliente/page'

vi.mock('@/lib/hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({
    user: { nome: 'User', email: 'user@example.com', telefone: '123', role: 'usuario' },
    authChecked: true,
  }),
}))

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({ authStore: { token: 't' } })),
}))

// silence fetch for useEffect
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) }) as any
})

test('abre modal ao clicar em Alterar senha', async () => {
  render(<AreaCliente />)
  fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))
  expect(
    await screen.findByRole('heading', { name: /redefinir senha/i })
  ).toBeInTheDocument()
})
