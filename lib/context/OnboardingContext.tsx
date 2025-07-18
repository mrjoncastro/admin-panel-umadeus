'use client'
import { createContext, useContext, useState } from 'react'

export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'disconnected'

interface OnboardingContextType {
  step: 1 | 2 | 3 | 4 | 5
  instanceName: string
  apiKey: string
  telefone: string
  connection: ConnectionStatus
  loading: boolean
  setLoading: (v: boolean) => void
  setStep: (s: 1 | 2 | 3 | 4 | 5) => void
  setInstanceName: (v: string) => void
  setApiKey: (v: string) => void
  setTelefone: (v: string) => void
  setConnection: (v: ConnectionStatus) => void
}

const OnboardingContext = createContext<OnboardingContextType>({
  step: 1,
  instanceName: '',
  apiKey: '',
  telefone: '',
  connection: 'idle',
  loading: false,
  setLoading: () => {},
  setStep: () => {},
  setInstanceName: () => {},
  setApiKey: () => {},
  setTelefone: () => {},
  setConnection: () => {},
})

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [instanceName, setInstanceName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [telefone, setTelefone] = useState('')
  const [connection, setConnection] = useState<ConnectionStatus>('idle')
  const [loading, setLoading] = useState(false)

  return (
    <OnboardingContext.Provider
      value={{
        step,
        instanceName,
        apiKey,
        telefone,
        connection,
        loading,
        setLoading,
        setStep,
        setInstanceName,
        setApiKey,
        setTelefone,
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
