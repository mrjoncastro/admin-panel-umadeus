/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import InscricaoPage from '@/app/inscricoes/lider/[liderId]/evento/[eventoId]/page'
import { calculateGross } from '@/lib/asaasFees'

vi.mock('next/navigation', () => ({
  useParams: () => ({ liderId: 'lid1', eventoId: 'ev1' }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/context/TenantContext', () => ({
  useTenant: () => ({ config: { confirmaInscricoes: true } }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}))

describe('InscricaoPage', () => {
  it('renderiza título do evento', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ campo: 'Campo' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ titulo: 'Evento X', descricao: 'Desc' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ titulo: 'Evento X', descricao: 'Desc' }),
      })

    render(<InscricaoPage />)
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Evento X')
  })

  it('exibe total calculado', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ campo: 'Campo' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ titulo: 'Evento', descricao: 'Desc' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ titulo: 'Evento', descricao: 'Desc' }),
      })

    render(<InscricaoPage />)
    const gross = calculateGross(50, 'pix', 1).gross
    expect(
      await screen.findByText(`R$ ${gross.toFixed(2).replace('.', ',')}`),
    ).toBeInTheDocument()
  })
})
