/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InscricaoPage from '@/app/inscricoes/[liderId]/[eventoId]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ liderId: 'lid1', eventoId: 'ev1' })
}));

describe('InscricaoPage', () => {
  it('renderiza título do evento', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ campo: 'Campo' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ titulo: 'Evento X', descricao: 'Desc' }) });

    render(<InscricaoPage />);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Evento X');
  });
});
