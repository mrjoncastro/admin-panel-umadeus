/* @vitest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ListaInscricoesPage from '@/app/admin/inscricoes/page'

const pbMock = {
  autoCancellation: vi.fn(),
  collection: vi.fn((name: string) => {
    if (name === 'inscricoes') {
      return {
        getFullList: vi.fn().mockResolvedValue([
          {
            id: '1',
            nome: 'Fulano',
            telefone: '999999',
            cpf: '123',
            evento: 'evt1',
            status: 'pendente',
            created: '2025-01-01',
            produto: 'Prod',
            tamanho: 'P',
            genero: 'm',
            email: 'f@e.com',
            paymentMethod: 'pix',
            installments: 2,
            criado_por: 'u1',
            expand: {
              campo: { nome: 'Campo 1', id: 'c1', responsavel: 'r1' },
              evento: { titulo: 'Congresso Teste' },
              pedido: { id: 'p1', status: 'pago', valor: 10 },
            },
          },
        ]),
        getOne: vi.fn().mockResolvedValue({
          id: '1',
          nome: 'Fulano',
          telefone: '999999',
          cpf: '123',
          evento: 'evt1',
          status: 'pendente',
          created: '2025-01-01',
          produto: 'Prod',
          tamanho: 'P',
          genero: 'm',
          email: 'f@e.com',
          paymentMethod: 'pix',
          installments: 2,
          criado_por: 'u1',
          expand: {
            campo: { nome: 'Campo 1', id: 'c1', responsavel: 'r1' },
          },
        }),
        update: vi.fn().mockResolvedValue({}),
      }
    }
    if (name === 'eventos') {
      return {
        getFullList: vi.fn().mockResolvedValue([{ id: 'evt1', titulo: 'Congresso Teste' }]),
        getOne: vi.fn().mockResolvedValue({ id: 'evt1', expand: { produtos: [] } }),
      }
    }
    if (name === 'produtos') {
      return {
        getFirstListItem: vi.fn().mockResolvedValue({ nome: 'Prod', preco: 10, tamanhos: ['P'], generos: ['m'] }),
      }
    }
    if (name === 'pedidos') {
      return {
        create: vi.fn().mockResolvedValue({ id: 'ped1', valor: 10 }),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/hooks/useAuthGuard', () => ({
  useAuthGuard: () => ({
    user: { id: 'u1', role: 'coordenador', cliente: 't1' },
    pb: pbMock,
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
  const btn = container.querySelector('button.text-green-600') as HTMLButtonElement
  fireEvent.click(btn)

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/asaas/',
      expect.objectContaining({
        body: expect.stringContaining('"paymentMethod":"pix"'),
      })
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/admin/api/asaas/',
      expect.objectContaining({
        body: expect.stringContaining('"installments":2'),
      })
    )
  })
})
