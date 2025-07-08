'use client'
import { useEffect, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { useAuthContext } from '@/lib/context/AuthContext'

interface StepCreateInstanceProps {
  onRegistered: (url: string, base: string) => void
}

export default function StepCreateInstance({
  onRegistered,
}: StepCreateInstanceProps) {
  const { telefone, setStep, setInstanceName, setApiKey, setLoading } =
    useOnboarding()
  const { tenantId } = useAuthContext()
  const [error, setError] = useState<string>()

  useEffect(() => {
    const register = async () => {
      setLoading(true)
      setError(undefined)
      try {
        const pb = createPocketBase()
        const headers = {
          ...getAuthHeaders(pb),
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId!,
        }
        const res = await fetch('/api/chats/whatsapp/instance', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ telefone: `55${telefone}` }),
        })
        if (!res.ok) throw new Error(await res.text())
        const d = (await res.json()) as {
          instance: { instanceId: string; instanceName: string }
          instanceName?: string
          apiKey: string
          qrCodeUrl: string
          qrBase64: string
        }
        setInstanceName(d.instance.instanceName)
        setApiKey(d.apiKey)
        onRegistered(d.qrCodeUrl, d.qrBase64)
        setStep(3)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
        setStep(1)
      } finally {
        setLoading(false)
      }
    }
    if (telefone) register()
  }, [
    telefone,
    tenantId,
    onRegistered,
    setApiKey,
    setInstanceName,
    setLoading,
    setStep,
  ])

  return (
    <div className="card flex flex-col items-center p-8">
      <span>Configurando sua instância...</span>
      <progress className="progress w-40 mt-4" />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
