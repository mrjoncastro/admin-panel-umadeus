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
    id_asaas: 'pay1',
    link_pagamento: 'pay',
    vencimento: new Date(Date.now() - 86400000).toISOString(),
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

  it('exibe botão para nova cobrança quando vencimento expirou', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPedido()),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)

    expect(
      await screen.findByRole('button', { name: /Gerar nova cobrança/i })
    ).toBeInTheDocument()
  })

  it('chama endpoint ao gerar nova cobrança', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedido()) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            link_pagamento: 'x',
            vencimento: new Date().toISOString(),
          }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ModalVisualizarPedido pedidoId="p1" onClose={() => {}} />)
    const btn = await screen.findByRole('button', { name: /Gerar nova cobrança/i })
    fireEvent.click(btn)

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/pedidos/p1/nova-cobranca', expect.any(Object))
    })
  })
})
