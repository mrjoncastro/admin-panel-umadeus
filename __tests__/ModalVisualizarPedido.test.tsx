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
    link_pagamento: 'pay',
    expand: {
      id_inscricao: {
        nome: 'Fulano',
        telefone: '1',
        cpf: '000',
        evento: 'ev1',
      },
      responsavel: { id: 'u1', nome: 'User' },
    },
  }
}

function mockPedidoSemResponsavel() {
  const p = mockPedido()
  // @ts-expect-error removing responsavel for test
  delete p.expand.responsavel
  return p
}

describe('ModalVisualizarPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia e-mail ao reenviar pagamento', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPedido()),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    await screen.findByText(/Detalhes do Pedido/i)

    fireEvent.click(
      screen.getByRole('button', { name: /Reenviar link de pagamento/i }),
    )

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/email', expect.any(Object))
    })
  })

  it('exibe erro quando falha envio de e-mail', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPedido()),
      })
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    await screen.findByText(/Detalhes do Pedido/i)

    fireEvent.click(
      screen.getByRole('button', { name: /Reenviar link de pagamento/i }),
    )

    await vi.waitFor(() => {
      expect(toast.showError).toHaveBeenCalled()
    })
  })

  it('nao envia email se pedido nao tem responsavel', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPedidoSemResponsavel()),
      })
      .mockResolvedValueOnce({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    await screen.findByText(/Detalhes do Pedido/i)

    fireEvent.click(
      screen.getByRole('button', { name: /Reenviar link de pagamento/i }),
    )

    await vi.waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalledWith(
        '/api/email',
        expect.any(Object),
      )
    })
  })
})
