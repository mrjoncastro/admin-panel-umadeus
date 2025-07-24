import { logger } from '@/lib/logger'
'use client'

import { useEffect, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'

export default function TourIcon() {
  const { user, isLoggedIn } = useAuthContext()
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn || !user) return setVisible(false)
    const fezTour = Boolean(user.tour)
    setVisible(!fezTour)
  }, [isLoggedIn, user])

  if (!visible) return null

  async function iniciarTour() {
    const confirmar = window.confirm('Iniciar tour?')
    if (!confirmar || !user) return
    try {
      await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tour: true }),
      })
    } catch (err) {
      logger.error('Erro ao registrar tour', err)
    }
    router.push('/iniciar-tour')
  }

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <button
        onClick={iniciarTour}
        aria-label="Iniciar tour"
        className="bg-[var(--color-secondary)] text-[var(--background)] p-2 rounded-full shadow"
      >
        <MapPinned className="w-5 h-5" />
      </button>
    </div>
  )
}
