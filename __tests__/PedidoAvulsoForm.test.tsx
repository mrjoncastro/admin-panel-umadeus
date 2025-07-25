/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import PedidoAvulsoForm from '@/components/organisms/PedidoAvulsoForm'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', campo: 'c1' } }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}))

vi.mock('@/lib/hooks/useProdutos', () => ({
  default: () => ({
    produtos: [
      {
        id: 'p1',
        nome: 'Prod 1',
        evento_id: 'e1',
        requer_inscricao_aprovada: true,
        preco_bruto: 55,
        tamanhos: ['P', 'M'],
      },
    ],
    loading: false,
  }),
}))

describe('PedidoAvulsoForm', () => {
  it('envia dados com canal avulso', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ pedidoId: 'p1', valor: 55, status: 'pendente' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'pay', id_asaas: 'a1' }),
      })
    render(<PedidoAvulsoForm />)
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'Fulano' },
    })
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '52998224725' },
    })
    fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '11999999999' },
    })
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'f@x.com' },
    })
    fireEvent.change(screen.getByLabelText('Produto'), {
      target: { value: 'p1' },
    })
    expect(
      screen.getByRole('link', { name: /iniciar inscrição/i }),
    ).toBeInTheDocument()
    const valorField = screen.getByLabelText('Valor')
    expect(valorField).toHaveValue(55)
    expect(valorField).toHaveAttribute('readonly')
    fireEvent.change(screen.getByLabelText('Forma de Pagamento'), {
      target: { value: 'pix' },
    })
    fireEvent.click(screen.getByRole('button', { name: /criar pedido/i }))

    await waitFor(() => expect((global.fetch as any).mock.calls.length).toBe(3))
    const call = (global.fetch as any).mock.calls[1]
    expect(call[0]).toBe('/api/pedidos')
    const body = JSON.parse(call[1].body)
    expect(body.canal).toBe('avulso')
    expect(body.paymentMethod).toBe('pix')
    expect(body.tamanho).toBe('P')
    expect(push).toHaveBeenCalledWith('/admin/pedidos')
  })
})
