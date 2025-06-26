'use client'
import { useEffect, useRef, useMemo } from 'react'
import Joyride, { CallBackProps, Step, STATUS, StoreHelpers, Status } from 'react-joyride'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { HelpCircle } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useTenant } from '@/lib/context/TenantContext'

interface AdminClientTourProps {
  stepsByRoute: Record<string, Step[]>
}

export function AdminClientTour({ stepsByRoute }: AdminClientTourProps) {
  const pathname = usePathname()
  const { tenantId } = useAuthContext()
  const { config } = useTenant()
  const tourRef = useRef<StoreHelpers | null>(null)
  const steps = useMemo(() => stepsByRoute[pathname] || [], [pathname, stepsByRoute])
  const storageKey = `${tenantId ?? 'public'}-${pathname}-tour-completed`

  useEffect(() => {
    if (steps.length) {
      const done = localStorage.getItem(storageKey)
      if (!done) {
        tourRef.current?.reset(true)
      }
    }
  }, [steps, storageKey])

  function handleJoyrideCallback(data: CallBackProps) {
    const { status } = data
    const finishedStatuses: Status[] = [STATUS.FINISHED, STATUS.SKIPPED]
    if (finishedStatuses.includes(status)) {
      localStorage.setItem(storageKey, 'true')
      // espaço para métricas/analytics
    }
  }

  if (!steps.length) return null

  return (
    <>
      <Joyride
        getHelpers={(h) => {
          tourRef.current = h
        }}
        steps={steps}
        continuous
        showSkipButton
        scrollToFirstStep
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular',
        }}
        styles={{ options: { primaryColor: config.primaryColor, zIndex: 10000 } }}
        callback={handleJoyrideCallback}
      />
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="secondary" className="p-2 rounded-full" onClick={() => tourRef.current?.reset(true)}>
          <HelpCircle size={24} />
        </Button>
      </div>
    </>
  )
}

export default AdminClientTour
