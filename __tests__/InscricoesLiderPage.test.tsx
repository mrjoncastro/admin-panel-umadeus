/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import EscolherEventoPage from '@/app/inscricoes/lider/[liderId]/page'

vi.mock('next/navigation', () => ({
  useParams: () => ({ liderId: 'l1' }),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

describe('EscolherEventoPage', () => {
  it('nao exibe link para eventos realizados', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'e1',
            titulo: 'Ev',
            descricao: 'Desc',
            data: '',
            cidade: '',
            status: 'realizado',
          },
        ]),
    })

    render(<EscolherEventoPage />)

    await screen.findByText('Ev')
    expect(screen.getByText(/inscrições encerradas/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /inscrever/i })).not.toBeInTheDocument()
  })
})
