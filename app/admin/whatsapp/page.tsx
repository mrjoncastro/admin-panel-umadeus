'use client'

import { OnboardingWizard } from '@/components/admin'
import { useAuthGuard } from '@/lib/hooks/useAuthGuard'

export default function WhatsappPage() {
  const { authChecked } = useAuthGuard(['coordenador'])
  if (!authChecked) return null
  return (
    <div className="max-w-md mx-auto p-6">
      <OnboardingWizard />
    </div>
  )
}
