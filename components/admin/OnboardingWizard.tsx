'use client'
import { useEffect, useState } from 'react'
import StepSelectClient from '../onboarding/StepSelectClient'
import StepCreateInstance from '../onboarding/StepCreateInstance'
import StepPairing from '../onboarding/StepPairing'
import StepSendTest from '../onboarding/StepSendTest'
import StepComplete from '../onboarding/StepComplete'
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
  const [qrUrl, setQrUrl] = useState('')
  const [qrBase, setQrBase] = useState('')

  useEffect(() => {
    const tenant = localStorage.getItem('tenantId') || ''
    ;(async () => {
      try {
        const res = await fetch('/api/chats/whatsapp/instance/check', {
          headers: { 'x-tenant-id': tenant },
        })
        const check = (await res.json()) as CheckResponse
        if (!check) return
        setInstanceName(check.instanceName)
        setApiKey(check.apiKey)
        if (check.sessionStatus === 'connected') {
          setConnection('connected')
          setStep(4)
        } else {
          setConnection('pending')
          setStep(3)
        }
      } catch {
        /* ignore */
      }
    })()
  }, [setStep, setInstanceName, setApiKey, setConnection])

  const handleRegistered = (url: string, base: string) => {
    setQrUrl(url)
    setQrBase(base)
  }

  const handleConnected = () => {
    setStep(4)
  }

  return (
    <div className="wizard-container max-w-sm mx-auto">
      {step === 1 && <StepSelectClient onRegistered={handleRegistered} />}
      {step === 2 && <StepCreateInstance />}
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
