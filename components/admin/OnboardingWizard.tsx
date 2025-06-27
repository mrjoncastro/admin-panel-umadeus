'use client'
import { useEffect, useState } from 'react'
import createPocketBase from '@/lib/pocketbase'
import { getAuthHeaders } from '@/lib/authHeaders'
import { useAuthContext } from '@/lib/context/AuthContext'
import StepSelectClient from '../onboarding/StepSelectClient'
import StepCreateInstance from '../onboarding/StepCreateInstance'
import StepPairing from '../onboarding/StepPairing'
import StepComplete from '../onboarding/StepComplete'
import StepSendTest from '../onboarding/StepSendTest'
import OnboardingProgress from '../onboarding/OnboardingProgress'
import { LoadingOverlay } from '@/components/organisms'
import {
  OnboardingProvider,
  useOnboarding,
} from '@/lib/context/OnboardingContext'

type CheckResponse = {
  instanceName: string
  apiKey: string
  telefone: string
  sessionStatus: 'pending' | 'connected' | 'disconnected'
} | null

function WizardSteps() {
  const {
    step,
    setStep,
    setInstanceName,
    setApiKey,
    setConnection,
    setTelefone,
    loading,
    setLoading,
  } = useOnboarding()
  const { tenantId } = useAuthContext()
  const pb = createPocketBase()
  const [qrUrl, setQrUrl] = useState('')
  const [qrBase, setQrBase] = useState('')

  useEffect(() => {
    if (!tenantId) return
    ;(async () => {
      setLoading(true)
      try {
        const headers = {
          ...getAuthHeaders(pb),
          'x-tenant-id': tenantId,
        }
        const res = await fetch('/api/chats/whatsapp/instance/check', {
          headers,
          credentials: 'include',
        })
        const check = (await res.json()) as CheckResponse
        if (!check) return
        setInstanceName(check.instanceName)
        setApiKey(check.apiKey)
        setTelefone(check.telefone)
        if (check.sessionStatus === 'connected') {
          setConnection('connected')
          setStep(5)
        } else {
          setConnection('pending')
          setStep(3)
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    })()
  }, [
    tenantId,
    setStep,
    setInstanceName,
    setApiKey,
    setConnection,
    setTelefone,
    setLoading,
  ])

  const handleRegistered = (url: string, base: string) => {
    setQrUrl(url)
    setQrBase(base)
  }

  const handleConnected = () => {
    setStep(4)
  }

  return (
    <div className="wizard-container max-w-sm mx-auto">
      <LoadingOverlay show={loading} text="Carregando..." />
      <OnboardingProgress />
      {step === 1 && <StepSelectClient />}
      {step === 2 && <StepCreateInstance onRegistered={handleRegistered} />}
      {step === 3 && (
        <StepPairing
          qrCodeUrl={qrUrl}
          qrBase64={qrBase}
          onConnected={handleConnected}
        />
      )}
      {step === 4 && <StepSendTest />}
      {step === 5 && <StepComplete />}
    </div>
  )
}

export default function OnboardingWizard() {
  return (
    <OnboardingProvider>
      <WizardSteps />
    </OnboardingProvider>
  )
}
