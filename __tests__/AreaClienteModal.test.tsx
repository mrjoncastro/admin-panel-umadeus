/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import DashboardPage from '@/app/cliente/dashboard/page'

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

test('exibe sauda\u00e7\u00e3o ao carregar dashboard', async () => {
  render(<DashboardPage />)
  expect(await screen.findByText(/ol\u00e1, user/i)).toBeInTheDocument()
})
