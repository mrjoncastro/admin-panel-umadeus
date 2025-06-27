/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TourIcon from '@/app/admin/components/TourIcon'
import { useAuthContext } from '@/lib/context/AuthContext'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

const mockedAuth = vi.mocked(useAuthContext)

describe('TourIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('só aparece quando user.tour é falso', () => {
    mockedAuth.mockReturnValue({
      isLoggedIn: true,
      user: { id: 'u1', tour: false },
    })
    const { unmount } = render(<TourIcon />)
    expect(screen.getByLabelText('Iniciar tour')).toBeInTheDocument()
    unmount()

    mockedAuth.mockReturnValue({
      isLoggedIn: true,
      user: { id: 'u1', tour: true },
    })
    render(<TourIcon />)
    expect(screen.queryByLabelText('Iniciar tour')).toBeNull()
  })

  it('envia PATCH e redireciona após confirmar', async () => {
    mockedAuth.mockReturnValue({
      isLoggedIn: true,
      user: { id: 'u1', tour: false },
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<TourIcon />)
    fireEvent.click(screen.getByLabelText('Iniciar tour'))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/usuarios/u1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(pushMock).toHaveBeenCalledWith('/iniciar-tour')
  })
})
