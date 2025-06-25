'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import {
  connectInstance,
  fetchConnectionState,
} from '@/hooks/useWhatsappApi'

interface StepPairingProps {
  qrCodeUrl: string
  qrBase64: string
  onConnected: () => void
}

interface RawStateResponse {
  instance?: { state?: string }
  state?: string
}

interface ConnectResponse {
  qrCodeUrl: string
  qrBase64: string
}

export default function StepPairing({
  qrCodeUrl,
  qrBase64,
  onConnected,
}: StepPairingProps) {
  const { instanceName, apiKey, setConnection, loading, setLoading } =
    useOnboarding()
  const [codeUrl, setCodeUrl] = useState(qrCodeUrl)
  const [codeBase, setCodeBase] = useState(qrBase64)
  const [error, setError] = useState<string>()
  const attempts = useRef(0)
  const timeoutRef = useRef<number>()
  const [countdown, setCountdown] = useState(0)
  const countdownInterval = useRef<number>()

  useEffect(() => {
    if (countdown <= 0) return
    countdownInterval.current = window.setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(countdownInterval.current)
  }, [countdown])

  useEffect(() => {
    const poll = async () => {
      attempts.current++
      try {
        const raw = (await fetchConnectionState(
          instanceName,
          apiKey,
        )) as RawStateResponse
        const state = raw.instance?.state || raw.state
        if (state === 'open') {
          clearTimeout(timeoutRef.current)
          setConnection('connected')
          onConnected()
          return
        }
        if (state === 'close') {
          clearTimeout(timeoutRef.current)
          setError('Sessão fechada – gere novo QR.')
          setConnection('disconnected')
          return
        }
      } catch {}
      const delay =
        attempts.current === 1 ? 10 : attempts.current === 2 ? 20 : 30
      setCountdown(delay)
      timeoutRef.current = window.setTimeout(poll, delay * 1000)
    }
    attempts.current = 0
    setCountdown(10)
    timeoutRef.current = window.setTimeout(poll, 10 * 1000)
    return () => clearTimeout(timeoutRef.current)
  }, [instanceName, apiKey, onConnected, setConnection])

  const handleRegenerateQr = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const d = (await connectInstance(instanceName, apiKey)) as ConnectResponse
      setCodeUrl(d.qrCodeUrl)
      setCodeBase(d.qrBase64)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 text-center flex flex-col gap-4">
      <p>Escaneie o QR Code abaixo para autenticar:</p>
      <img
        src={codeBase ? `data:image/png;base64,${codeBase}` : codeUrl}
        alt="QR Code"
        className="mx-auto"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          onClick={handleRegenerateQr}
          disabled={loading}
        >
          {loading ? 'Gerando...' : 'Regerar QR Code'}
        </Button>
      </div>
      {countdown > 0 && (
        <p className="text-sm mt-2">
          Próxima tentativa em {countdown} segundo{countdown > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
