/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import EventoDetalhePage from '@/app/loja/eventos/[id]/page'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

vi.mock('next/headers', () => ({
  headers: () => new Headers({ host: 'localhost:3000' }),
}))

describe('EventoDetalhePage', () => {
  it('nao exibe formulario quando evento esta realizado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'e1',
          titulo: 'Ev',
          descricao: 'Desc',
          status: 'realizado',
        }),
    })

    render(
      await EventoDetalhePage({ params: Promise.resolve({ id: 'e1' }) } as any),
    )

    expect(screen.getByText(/inscrições encerradas/i)).toBeInTheDocument()
    expect(screen.queryByText(/inscrever/i)).not.toBeInTheDocument()
  })
})
