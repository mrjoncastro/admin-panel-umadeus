'use client'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/lib/context/AuthContext'
import StepSelectClient from '../onboarding/StepSelectClient'
import StepCreateInstance from '../onboarding/StepCreateInstance'
import StepPairing from '../onboarding/StepPairing'
import StepComplete from '../onboarding/StepComplete'
import StepSendTest from '../onboarding/StepSendTest'
import OnboardingProgress from '../onboarding/OnboardingProgress'
import {
  OnboardingProvider,
  useOnboarding,
} from '@/lib/context/OnboardingContext'

type CheckResponse = {
  instanceName: string
  apiKey: string
  sessionStatus: 'pending' | 'connected' | 'disconnected'
} | null

function WizardSteps() {
  const { step, setStep, setInstanceName, setApiKey, setConnection } =
    useOnboarding()
  const { tenantId } = useAuthContext()
  const [qrUrl, setQrUrl] = useState('')
  const [qrBase, setQrBase] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!tenantId) return
    ;(async () => {
      try {
        const res = await fetch('/api/chats/whatsapp/instance/check', {
          headers: { 'x-tenant-id': tenantId },
        })
        const check = (await res.json()) as CheckResponse
        if (!check) return
        setInstanceName(check.instanceName)
        setApiKey(check.apiKey)
        if (check.sessionStatus === 'connected') {
          setConnection('connected')
          setStep(5)
        } else {
          setConnection('pending')
          setStep(3)
        }
      } catch {
        /* ignore */
      }
    })()
  }, [tenantId, setStep, setInstanceName, setApiKey, setConnection])

  const handleRegistered = (url: string, base: string) => {
    setQrUrl(url)
    setQrBase(base)
  }

  const handlePhoneSelected = (tel: string) => {
    setPhone(tel)
  }

  const handleConnected = () => {
    setStep(4)
  }

  return (
    <div className="wizard-container max-w-sm mx-auto">
      <OnboardingProgress />
      {step === 1 && (
        <StepSelectClient onSelected={handlePhoneSelected} />
      )}
      {step === 2 && (
        <StepCreateInstance phone={phone} onRegistered={handleRegistered} />
      )}
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
