/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ListaInscricoesPage from '@/app/admin/inscricoes/page'

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    autoCancellation: vi.fn(),
    collection: () => ({
      getFullList: vi.fn().mockResolvedValue([
        {
          id: '1',
          nome: 'Fulano',
          telefone: '999999',
          cpf: '123',
          evento: 'evt1',
          status: 'pendente',
          created: '2025-01-01',
          expand: {
            campo: { nome: 'Campo 1', id: 'c1' },
            evento: { titulo: 'Congresso Teste' },
            pedido: { id: 'p1', status: 'pago', valor: 10 },
          },
        },
      ]),
    }),
  })),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', role: 'coordenador' }, tenantId: 't1' }),
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
