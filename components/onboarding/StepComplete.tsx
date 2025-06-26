'use client'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import { useState } from 'react'
import { maskPhone } from '@/utils/formatPhone'

export default function StepComplete() {
  const { telefone, setStep, setConnection } = useOnboarding()
  const { tenantId } = useAuthContext()
  const [loading, setLoading] = useState(false)


  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await fetch('/api/chats/whatsapp/instance/delete', {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId! },
      })
      setConnection('idle')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 text-center flex flex-col items-center gap-2">
      <CheckCircle className="text-green-600 w-8 h-8" />
      <p className="font-medium">Número conectado:</p>
      <p>{maskPhone(telefone?.replace(/^55/, '') || '')}</p>
      <Button variant="secondary" onClick={handleDisconnect} disabled={loading}>
        {loading ? 'Desconectando...' : 'Desconectar'}
      </Button>
      <p className="text-xs text-neutral-600 mt-1 text-center">
        Apenas um número por cliente. Para usar outro número, desconecte e
        reinicie o processo.
      </p>
    </div>
  )
}
