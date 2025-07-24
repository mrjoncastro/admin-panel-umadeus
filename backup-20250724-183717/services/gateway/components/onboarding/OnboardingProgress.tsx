'use client'
import { useOnboarding } from '@/lib/context/OnboardingContext'

export default function OnboardingProgress() {
  const { step } = useOnboarding()
  const total = 5
  return (
    <div className="mb-4">
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <div className="text-center mt-1 text-sm text-neutral-600">
        Passo {step} de {total}
      </div>
    </div>
  )
}
