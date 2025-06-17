/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProdutoDetalhe from '@/app/loja/produtos/[slug]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'prod1' })
}));

const getFirstListItemProduto = vi.fn().mockResolvedValue({
  id: 'prod1',
  nome: 'Camiseta',
  preco: 10,
  descricao: '',
  imagens: [],
  tamanhos: '',
  generos: '',
  slug: 'prod1'
});

const getFirstListItemCliente = vi.fn().mockResolvedValue({ id: 'cli1' });

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    collection: (name: string) => {
      if (name === 'clientes_config') {
        return { getFirstListItem: getFirstListItemCliente };
      }
      if (name === 'produtos') {
        return { getFirstListItem: getFirstListItemProduto };
      }
      return { getFirstListItem: vi.fn() };
    },
    files: { getURL: vi.fn(() => 'img') }
  }))
}));

describe('ProdutoDetalhe', () => {
  it('carrega produto sem localStorage', async () => {
    localStorage.removeItem('tenant_id');
    render(<ProdutoDetalhe />);
    await screen.findByRole('heading', { name: /Camiseta/i });
    expect(getFirstListItemCliente).toHaveBeenCalled();
    expect(getFirstListItemProduto).toHaveBeenCalledWith(
      "slug = 'prod1' && cliente='cli1'"
    );
    expect(localStorage.getItem('tenant_id')).toBe('cli1');
  });
});
