/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import OnboardingWizard from '@/components/admin/OnboardingWizard'
import { useOnboarding } from '@/lib/context/OnboardingContext'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 't1' }),
}))

vi.mock('@/components/onboarding/StepSelectClient', () => {
  return {
    __esModule: true,
    default: function Step1() {
      const { setStep } = useOnboarding()
      return (
        <div>
          Step1<button onClick={() => setStep(2)}>next1</button>
        </div>
      )
    },
  }
})

vi.mock('@/components/onboarding/StepCreateInstance', () => {
  return {
    __esModule: true,
    default: function Step2() {
      const { setStep } = useOnboarding()
      return (
        <div>
          Step2<button onClick={() => setStep(3)}>next2</button>
        </div>
      )
    },
  }
})

vi.mock('@/components/onboarding/StepPairing', () => {
  return {
    __esModule: true,
    default: function Step3() {
      const { setStep } = useOnboarding()
      return (
        <div>
          Step3<button onClick={() => setStep(4)}>next3</button>
        </div>
      )
    },
  }
})

vi.mock('@/components/onboarding/StepSendTest', () => {
  return {
    __esModule: true,
    default: function Step4() {
      const { setStep } = useOnboarding()
      return (
        <div>
          Step4<button onClick={() => setStep(5)}>next4</button>
        </div>
      )
    },
  }
})

vi.mock('@/components/onboarding/StepComplete', () => ({
  __esModule: true,
  default: () => <div>Step5</div>,
}))

vi.mock('@/components/onboarding/OnboardingProgress', () => ({
  __esModule: true,
  default: () => <div>Progress</div>,
}))

global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(null) }) as unknown as typeof fetch

describe('OnboardingWizard', () => {
  it('avanca pelas etapas ao clicar nos botoes', () => {
    render(<OnboardingWizard />)
    expect(screen.getByText('Step1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('next1'))
    expect(screen.getByText('Step2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('next2'))
    expect(screen.getByText('Step3')).toBeInTheDocument()
    fireEvent.click(screen.getByText('next3'))
    expect(screen.getByText('Step4')).toBeInTheDocument()
    fireEvent.click(screen.getByText('next4'))
    expect(screen.getByText('Step5')).toBeInTheDocument()
  })

  it('exibe overlay enquanto check pendente', async () => {
    let resolveFetch: (v: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    ;(global.fetch as vi.Mock).mockReturnValueOnce(fetchPromise as any)

    render(<OnboardingWizard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    resolveFetch({ ok: true, json: () => Promise.resolve(null) })

    await waitFor(() =>
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument(),
    )
  })
})
