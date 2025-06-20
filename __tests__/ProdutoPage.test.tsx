/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProdutoDetalhe from '@/app/loja/produtos/[slug]/page'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'prod1' }),
}))

describe('ProdutoDetalhe', () => {
  it('carrega produto', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'prod1',
          nome: 'Camiseta',
          preco: 10,
          descricao: '',
          imagens: [],
          tamanhos: '',
          generos: '',
          slug: 'prod1',
        }),
    })

    render(<ProdutoDetalhe />)
    await screen.findByRole('heading', { name: /Camiseta/i })
    expect(global.fetch).toHaveBeenCalledWith('/api/produtos/prod1')
  })
})
