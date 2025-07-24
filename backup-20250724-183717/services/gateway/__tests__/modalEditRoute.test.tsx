/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ModalEditarInscricao from '@/app/admin/inscricoes/componentes/ModalEdit'

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({ user: { cliente: 't1' } }),
}))

vi.mock('@/lib/pocketbase', () => {
  const collection = {
    getFullList: vi.fn(async () => {
      await fetch('/api/eventos')
      return []
    }),
  }
  return {
    __esModule: true,
    default: () => ({ collection: vi.fn(() => collection) }),
  }
})

it('usa APIs publicas ao carregar e salvar', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
  global.fetch = fetchMock as unknown as typeof fetch

  render(
    <ModalEditarInscricao
      inscricao={
        {
          id: 'i1',
          nome: 'X',
          telefone: '1',
          status: 'pendente',
          eventoId: 'e1',
          evento: 'E',
        } as any
      }
      onClose={() => {}}
      onSave={(data) =>
        fetch(`/api/inscricoes/i1`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      }
    />,
  )

  const btn = await screen.findByRole('button', { name: /salvar/i })
  fireEvent.click(btn)

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith('/api/eventos')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/inscricoes/i1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    fetchMock.mock.calls.forEach(([url]) => {
      expect(url).not.toMatch(/^\/api\/collections\//)
    })
  })
})
