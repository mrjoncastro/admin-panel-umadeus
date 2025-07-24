/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import StepSendTest from '@/components/onboarding/StepSendTest'

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 't1' }),
}))

const setStep = vi.fn()
vi.mock('@/lib/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    instanceName: 'inst',
    setStep,
    loading: false,
    setLoading: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('StepSendTest', () => {
  it('exibe erro quando recebe status 409', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ status: 409, ok: false }) as unknown as typeof fetch

    render(<StepSendTest />)
    const input = screen.getByPlaceholderText('(11) 99999-9999')
    fireEvent.change(input, { target: { value: '11999999999' } })
    fireEvent.click(screen.getByText('Enviar Mensagem'))

    await screen.findByText('Teste já executado')
    expect(setStep).not.toHaveBeenCalled()
  })
})
