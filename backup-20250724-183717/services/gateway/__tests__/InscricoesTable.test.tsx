/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import InscricoesTable from '@/app/cliente/components/InscricoesTable'

vi.mock('@/lib/hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({
    user: { role: 'usuario' },
    authChecked: true,
  }),
}))

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({})),
}))

vi.mock('@/lib/authHeaders', () => ({
  getAuthHeaders: vi.fn(() => ({})),
}))

test('exibe mensagem de erro quando falha carregamento', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('fail')) as any
  render(<InscricoesTable />)
  expect(
    await screen.findByText(
      /Não foi possível carregar inscrições. Tente mais tarde./i,
    ),
  ).toBeInTheDocument()
})
