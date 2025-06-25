'use client'
import { useEffect, useRef, useState } from 'react'
import { useOnboarding } from '@/lib/context/OnboardingContext'

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
  const { instanceName, apiKey, setStep, setConnection } = useOnboarding()
  const [codeUrl, setCodeUrl] = useState(qrCodeUrl)
  const [codeBase, setCodeBase] = useState(qrBase64)
  const [loading, setLoading] = useState(false)
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
        const res = await fetch(
          '/api/chats/whatsapp/instance/connectionState',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': localStorage.getItem('tenantId') || '',
            },
            body: JSON.stringify({ instanceName, apiKey }),
          },
        )
        if (res.ok) {
          const raw = (await res.json()) as RawStateResponse
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
      const res = await fetch('/api/chats/whatsapp/instance/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': localStorage.getItem('tenantId') || '',
        },
        body: JSON.stringify({ instanceName, apiKey }),
      })
      if (res.status === 404) {
        setError('Instância não encontrada; recrie.')
        setStep(1)
        setConnection('disconnected')
        return
      }
      if (!res.ok) throw new Error((await res.json()).error || 'Erro')
      const d = (await res.json()) as ConnectResponse
      setCodeUrl(d.qrCodeUrl)
      setCodeBase(d.qrBase64)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 text-center flex flex-col gap-4">
      <p>Escaneie o QR Code abaixo para autenticar:</p>
      <img
        src={codeBase ? `data:image/png;base64,${codeBase}` : codeUrl}
        alt="QR Code"
        className="mx-auto"
      />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2 justify-center">
        <button
          className="btn btn-secondary"
          onClick={handleRegenerateQr}
          disabled={loading}
        >
          {loading ? 'Gerando...' : 'Regerar QR Code'}
        </button>
      </div>
      {countdown > 0 && (
        <p className="text-sm mt-2">
          Próxima tentativa em {countdown} segundo{countdown > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
