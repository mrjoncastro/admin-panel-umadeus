/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ListaInscricoesPage from '@/app/admin/inscricoes/page'

vi.mock('@/lib/hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({
    user: { id: 'u1', role: 'coordenador', cliente: 't1' },
    authChecked: true,
  }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}))

vi.mock('@/app/admin/inscricoes/componentes/ModalEdit', () => ({
  __esModule: true,
  default: () => <div />,
}))

vi.mock('@/app/admin/inscricoes/componentes/ModalVisualizarPedido', () => ({
  __esModule: true,
  default: () => <div />,
}))

vi.mock('@/app/admin/components/TooltipIcon', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

test('exibe titulo do evento na tabela', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 'e1', titulo: 'Congresso Teste' }]),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'i1',
            expand: { evento: { titulo: 'Congresso Teste' } },
          },
        ]),
    })

  render(<ListaInscricoesPage />)
  expect(await screen.findByText('Congresso Teste')).toBeInTheDocument()
})

test('envia paymentMethod e installments ao confirmar', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'pay' }),
    })
    .mockResolvedValue({ ok: true })
  global.fetch = fetchMock as unknown as typeof fetch

  const { container } = render(<ListaInscricoesPage />)

  await screen.findByText('Fulano')
  const btn = container.querySelector(
    'button.text-green-600',
  ) as HTMLButtonElement
  fireEvent.click(btn)

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/asaas/',
      expect.objectContaining({
        body: expect.stringContaining('"paymentMethod":"pix"'),
      }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/asaas/',
      expect.objectContaining({
        body: expect.stringContaining('"installments":2'),
      }),
    )
  })
})
