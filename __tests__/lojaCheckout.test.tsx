/* @vitest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CheckoutPage from '@/app/loja/checkout/page';

vi.mock('@/lib/context/CartContext', () => ({
  useCart: () => ({
    itens: [
      {
        id: 'p1',
        variationId: 'p1-',
        nome: 'Produto',
        preco: 10,
        quantidade: 1,
        slug: 'prod1',
        generos: '',
        tamanhos: '',
        cores: '',
      },
    ],
    clearCart: vi.fn(),
  }),
}));

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({
    isLoggedIn: true,
    user: { id: 'u1', nome: 'User' },
    tenantId: 't1',
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe('CheckoutContent', () => {
  it('não exibe valor da parcela quando há uma parcela', () => {
    render(<CheckoutPage />);
    expect(screen.queryByText('Valor da parcela')).toBeNull();
  });

  it('desabilita select de parcelas quando forma de pagamento não é crédito', () => {
    render(<CheckoutPage />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).toBeDisabled();
  });

  it('mantém total a pagar calculado com pix ao mudar forma de pagamento', () => {
    render(<CheckoutPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'credito' } });
    fireEvent.change(selects[1], { target: { value: '2' } });
    expect(screen.getByText('R$ 12,69')).toBeInTheDocument();
  });

  it('exibe valor da parcela apenas uma vez quando há mais de uma parcela', () => {
    render(<CheckoutPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'credito' } });
    fireEvent.change(selects[1], { target: { value: '2' } });
    expect(screen.getAllByText('Valor da parcela')).toHaveLength(1);
    expect(screen.getByText('R$ 5,79')).toBeInTheDocument();
  });
});
