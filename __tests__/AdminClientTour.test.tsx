/* @vitest-environment jsdom */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AdminClientTour from '@/components/AdminClientTour'

let joyrideCallback: any
const resetMock = vi.fn()

vi.mock('react-joyride', () => ({
  __esModule: true,
  STATUS: { FINISHED: 'finished', SKIPPED: 'skipped' },
  default: (props: any) => {
    joyrideCallback = props.callback
    props.getHelpers({ reset: resetMock })
    return <div>JoyrideMock</div>
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
}))

vi.mock('lucide-react', () => ({ HelpCircle: () => <svg /> }))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 't1' }),
}))

vi.mock('@/lib/context/TenantContext', () => ({
  useTenant: () => ({ config: { primaryColor: '#000' } }),
}))

const steps = { '/admin/dashboard': [{ target: '.a', content: 'a' }] }

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AdminClientTour', () => {
  it('inicia tour na primeira visita e grava flag', () => {
    render(<AdminClientTour stepsByRoute={steps} />)
    expect(resetMock).toHaveBeenCalledWith(true)
    joyrideCallback({ status: 'finished' })
    expect(localStorage.getItem('t1-/admin/dashboard-tour-completed')).toBe('true')
    expect(screen.getByLabelText('Ajuda')).toBeInTheDocument()
  })

  it('reinicia tour ao clicar em \u201cAjuda\u201d', async () => {
    localStorage.setItem('t1-/admin/dashboard-tour-completed', 'true')
    render(<AdminClientTour stepsByRoute={steps} />)
    expect(resetMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByLabelText('Ajuda'))

    expect(resetMock).toHaveBeenCalledWith(true)
  })
})
