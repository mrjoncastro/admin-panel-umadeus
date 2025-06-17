/* @vitest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import EventosPage from '@/app/loja/eventos/page';
import getTenantFromClient from '@/lib/getTenantFromClient';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

vi.mock('@/lib/getTenantFromClient', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue('t1'),
}));

describe('EventosPage', () => {
  it('exibe formulario apos clicar em Inscrever', async () => {
    localStorage.setItem('tenant_id', 't1');
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'e1', titulo: 'Ev', descricao: '', data: '', cidade: '', status: 'em breve' }]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) });

    render(<EventosPage />);

    expect(screen.queryByRole('combobox', { name: /campo/i })).not.toBeInTheDocument();
    const button = await screen.findByRole('button', { name: /inscrever/i });
    fireEvent.click(button);
    const select = await screen.findByRole('combobox', { name: /campo/i });
    expect(select).toBeInTheDocument();
  });

  it('carrega eventos sem tenant no localStorage', async () => {
    localStorage.clear();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 'e1', titulo: 'Ev', descricao: '', data: '', cidade: '', status: 'em breve' },
          ]),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) });
    global.fetch = fetchMock;

    render(<EventosPage />);

    await screen.findByRole('button', { name: /inscrever/i });
    expect(getTenantFromClient).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('/api/eventos?tenant=t1');
  });
});
