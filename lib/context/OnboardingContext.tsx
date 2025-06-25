'use client'
import { createContext, useContext, useState } from 'react'

export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'disconnected'

interface OnboardingContextType {
  step: 1 | 2 | 3 | 4
  instanceName: string
  apiKey: string
  connection: ConnectionStatus
  setStep: (s: 1 | 2 | 3 | 4) => void
  setInstanceName: (v: string) => void
  setApiKey: (v: string) => void
  setConnection: (v: ConnectionStatus) => void
}

const OnboardingContext = createContext<OnboardingContextType>({
  step: 1,
  instanceName: '',
  apiKey: '',
  connection: 'idle',
  setStep: () => {},
  setInstanceName: () => {},
  setApiKey: () => {},
  setConnection: () => {},
})

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [instanceName, setInstanceName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [connection, setConnection] = useState<ConnectionStatus>('idle')

  return (
    <OnboardingContext.Provider
      value={{
        step,
        instanceName,
        apiKey,
        connection,
        setStep,
        setInstanceName,
        setApiKey,
        setConnection,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  return useContext(OnboardingContext)
}
