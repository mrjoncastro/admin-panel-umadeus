'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { stepsByRoute } from './tourSteps'
import type { ComponentType } from 'react'

export default function AdminClientTourLoader() {
  const pathname = usePathname()
  const [Tour, setTour] = useState<ComponentType<{
    stepsByRoute: typeof stepsByRoute
  }> | null>(null)

  useEffect(() => {
    const steps = stepsByRoute[pathname]
    if (!steps || steps.length === 0) {
      setTour(null)
      return
    }
    import('./AdminClientTour').then((mod) => {
      setTour(() => mod.default)
    })
  }, [pathname])

  if (!Tour) return null

  return <Tour stepsByRoute={stepsByRoute} />
}
