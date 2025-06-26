/* @vitest-environment jsdom */
import React from 'react'
import { render } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import StepPairing from '@/components/onboarding/StepPairing'
import { fetchConnectionState } from '@/hooks/useWhatsappApi'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { useAuthContext } from '@/lib/context/AuthContext'

vi.mock('@/hooks/useWhatsappApi', () => ({
  fetchConnectionState: vi.fn(),
  connectInstance: vi.fn(),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 't1' }),
}))

const setConnection = vi.fn()
vi.mock('@/lib/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    instanceName: 'inst',
    apiKey: 'key',
    setConnection,
    loading: false,
    setLoading: vi.fn(),
  }),
}))


beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('StepPairing polling', () => {
  it('tenta novamente ate conectar', async () => {
    ;(fetchConnectionState as unknown as vi.Mock).mockResolvedValueOnce({
      instance: { state: 'connecting' },
    }).mockResolvedValueOnce({
      instance: { state: 'open' },
    })

    const onConnected = vi.fn()
    render(<StepPairing qrCodeUrl="u" qrBase64="b" onConnected={onConnected} />)

    await vi.advanceTimersByTimeAsync(10000)
    expect(fetchConnectionState).toHaveBeenCalledTimes(1)
    expect(onConnected).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(10000)
    expect(fetchConnectionState).toHaveBeenCalledTimes(2)
    expect(onConnected).toHaveBeenCalled()
    expect(setConnection).toHaveBeenCalledWith('connected')
  })
})


