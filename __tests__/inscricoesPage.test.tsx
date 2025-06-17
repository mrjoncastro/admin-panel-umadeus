/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ListaInscricoesPage from '@/app/admin/inscricoes/page'

const pbMock = {
  autoCancellation: vi.fn(),
  collection: vi.fn((name: string) => ({
    getFullList: vi.fn().mockResolvedValue(
      name === 'inscricoes'
        ? [
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
          ]
        : name === 'eventos'
        ? [{ id: 'evt1', titulo: 'Congresso Teste' }]
        : []
    ),
  })),
};

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
