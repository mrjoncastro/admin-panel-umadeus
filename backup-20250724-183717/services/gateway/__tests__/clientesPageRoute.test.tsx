/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ClientesPage from '@/app/admin/clientes/page'

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 't1' }),
}))

vi.mock('@/lib/hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({ authChecked: true }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}))

vi.mock('@/lib/pocketbase', () => {
  const collection = {
    getFullList: vi.fn(async () => {
      await fetch('/api/inscricoes')
      return [
        {
          id: 'i1',
          nome: 'Fulano',
          telefone: '1',
          eventoId: 'e1',
          expand: { evento: { titulo: 'Evento' }, pedido: {} },
        },
      ]
    }),
    update: vi.fn(async (id: string, data: any) => {
      await fetch(`/api/inscricoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    }),
  }
  return {
    __esModule: true,
    default: () => ({ collection: vi.fn(() => collection) }),
  }
})

it('chama APIs corretas ao salvar cliente', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
  global.fetch = fetchMock as unknown as typeof fetch

  render(<ClientesPage />)

  await screen.findByText('Fulano')
  const btn = screen.getByRole('button', { name: /editar/i })
  fireEvent.click(btn)

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/admin/api/clientes?'),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/clientes/i1',
      expect.objectContaining({ method: 'PUT' }),
    )
  })
})
