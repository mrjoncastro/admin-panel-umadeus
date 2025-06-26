/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import AdminClientTourLoader from '@/components/AdminClientTourLoader'

let pathname = '/admin/dashboard'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

const importSpy = vi.fn()
vi.mock('@/components/AdminClientTour', () => {
  importSpy()
  return { __esModule: true, default: () => <div>TourComponent</div> }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminClientTourLoader', () => {
  it('carrega tour quando ha passos para a rota', async () => {
    pathname = '/admin/dashboard'
    render(<AdminClientTourLoader />)
    await screen.findByText('TourComponent')
    expect(importSpy).toHaveBeenCalled()
  })

  it('nao carrega tour quando nao ha passos', async () => {
    pathname = '/sem-roteiro'
    render(<AdminClientTourLoader />)
    await waitFor(() => {
      expect(screen.queryByText('TourComponent')).toBeNull()
    })
    expect(importSpy).not.toHaveBeenCalled()
  })
})
