/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InscricaoPage from '@/app/inscricoes/lider/[liderId]/evento/[eventoId]/page'

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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          titulo: 'Evento X',
          descricao: 'Desc',
          status: 'em breve',
        }),
    })

    render(<InscricaoPage />)
    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Evento X')
  })

  it('exibe wizard apos consulta sem resultado', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            titulo: 'Evento',
            descricao: 'Desc',
            status: 'em breve',
          }),
      })
      .mockResolvedValueOnce({ status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cobra_inscricao: false }),
      })

    const { container } = render(<InscricaoPage />)
    fireEvent.change(await screen.findByLabelText(/cpf/i), {
      target: { value: '52998224725' },
    })
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'x@y.com' },
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(await screen.findByLabelText(/nome/i)).toBeInTheDocument()
  })
})
