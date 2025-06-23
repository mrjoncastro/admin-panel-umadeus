/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ModalVisualizarPedido from '@/app/admin/inscricoes/componentes/ModalVisualizarPedido'

const toast = { showSuccess: vi.fn(), showError: vi.fn() }
vi.mock('@/lib/context/ToastContext', () => {
  return {
    useToast: () => toast,
  }
})

function mockPedido() {
  return {
    id: 'p1',
    valor: 10,
    status: 'pendente',
    produto: [],
    id_pagamento: 'c1',
    expand: {
      id_inscricao: { nome: 'Fulano', telefone: '1', cpf: '000', evento: 'ev1' },
      responsavel: { id: 'u1', nome: 'User' },
    },
  }
}

describe('ModalVisualizarPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia e-mail ao reenviar pagamento', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedido()) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ url: 'pay' }) })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    await screen.findByText(/Detalhes do Pedido/i)

    fireEvent.click(screen.getByRole('button', { name: /Reenviar link de pagamento/i }))

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/email', expect.any(Object))
    })
  })

  it('exibe erro quando falha envio de e-mail', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedido()) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ url: 'pay' }) })
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    await screen.findByText(/Detalhes do Pedido/i)

    fireEvent.click(screen.getByRole('button', { name: /Reenviar link de pagamento/i }))

    await vi.waitFor(() => {
      expect(toast.showError).toHaveBeenCalled()
    })
  })
})
