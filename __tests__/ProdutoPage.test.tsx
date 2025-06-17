/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProdutoDetalhe from '@/app/loja/produtos/[slug]/page';
import getTenantFromClient from '@/lib/getTenantFromClient';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'p1' })
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt} />;
  }
}));

vi.mock('@/lib/getTenantFromClient', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue('t1'),
}));

const getFirstListItem = vi.fn().mockResolvedValue({
  id: 'p1',
  nome: 'Produto',
  descricao: 'Desc',
  preco: 10,
  slug: 'p1',
  imagens: ['img.jpg']
});

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: () => ({
    collection: () => ({ getFirstListItem }),
    files: { getURL: () => '/img.jpg' }
  })
}));

describe('ProdutoDetalhe', () => {
  it('carrega dados mesmo sem tenant salvo', async () => {
    localStorage.clear();
    render(<ProdutoDetalhe />);
    expect(await screen.findByText('Produto')).toBeInTheDocument();
    expect(getTenantFromClient).toHaveBeenCalled();
    expect(getFirstListItem).toHaveBeenCalledWith("slug = 'p1' && cliente='t1'");
  });
});
