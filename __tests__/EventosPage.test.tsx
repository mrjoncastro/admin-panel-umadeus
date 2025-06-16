/* @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import EventosPage from '@/app/loja/eventos/page';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('EventosPage', () => {
  it('renderiza dropdown de campos', async () => {
    localStorage.setItem('tenant_id', 't1');
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) });

    render(<EventosPage />);

    const select = await screen.findByRole('combobox', { name: /campo/i });
    expect(select).toBeInTheDocument();
  });
});
