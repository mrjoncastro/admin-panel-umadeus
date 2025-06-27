'use client'
import { useEffect, useRef, useMemo } from 'react'
import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  StoreHelpers,
  Status,
} from 'react-joyride'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/atoms/Button'
import { HelpCircle } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'

interface AdminClientTourProps {
  stepsByRoute: Record<string, Step[]>
}

export function AdminClientTour({ stepsByRoute }: AdminClientTourProps) {
  const pathname = usePathname()
  const { tenantId } = useAuthContext()
  const tourRef = useRef<StoreHelpers | null>(null)
  const steps = useMemo(
    () => stepsByRoute[pathname] || [],
    [pathname, stepsByRoute],
  )
  const validSteps = steps.filter((step) => {
    try {
      return Boolean(document.querySelector(step.target as string))
    } catch {
      return false
    }
  })
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

  if (!validSteps.length) return null

  return (
    <>
      <Joyride
        getHelpers={(h) => {
          tourRef.current = h
        }}
        steps={validSteps}
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
        styles={{ options: { primaryColor: 'var(--accent)', zIndex: 10000 } }}
        callback={handleJoyrideCallback}
      />
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="secondary"
          className="p-2 rounded-full"
          aria-label="Ajuda"
          onClick={() => tourRef.current?.reset(true)}
        >
          <HelpCircle size={24} />
        </Button>
      </div>
    </>
  )
}

export default AdminClientTour
