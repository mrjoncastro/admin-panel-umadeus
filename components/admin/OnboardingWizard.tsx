'use client'
import { useState, useEffect, useRef } from 'react'

type RegisterResponse = {
  instance: { instanceId: string; instanceName: string }
  apiKey: string
  pairingCode: string
  qrCodeUrl: string
  qrBase64: string
}

type ConnectResponse = {
  pairingCode: string
  qrCodeUrl: string
  qrBase64: string
}

type StateResponse = {
  status: 'pending' | 'connected' | 'disconnected'
}

export default function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [telefoneLocal, setTelefoneLocal] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrBase64, setQrBase64] = useState('')
  const [destLocal, setDestLocal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [sentOk, setSentOk] = useState(false)

  // polling state
  const attempts = useRef(0)
  const timeoutRef = useRef<number>()
  const [countdown, setCountdown] = useState<number>(0)
  const countdownInterval = useRef<number>()

  // mask helpers
  const maskPhone = (digits: string) => {
    const d = digits.slice(0, 2),
      n = digits.slice(2)
    let p1 = '',
      p2 = ''
    if (n.length <= 4) p1 = n
    else if (n.length <= 8) {
      p1 = n.slice(0, 4)
      p2 = n.slice(4)
    } else {
      p1 = n.slice(0, 5)
      p2 = n.slice(5)
    }
    return `(${d}) ${p1}${p2 ? '-' + p2 : ''}`
  }

  // input handlers
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let r = e.target.value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)
    setTelefoneLocal(r)
  }
  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let r = e.target.value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)
    setDestLocal(r)
  }

  // doGenerate logic as before (omitted for brevity)
  const doGenerate = async (connectOnly = false) => {
    // ... same as previous version ...
    // on create success: setStep(3); attempts.current = 0
  }
  const handleRegister = () => doGenerate(false)
  const handleRegenerateQr = () => doGenerate(true)

  // countdown effect
  useEffect(() => {
    if (countdown <= 0) return
    countdownInterval.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownInterval.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(countdownInterval.current)
  }, [countdown])

  // polling connectionState with dynamic delays
  useEffect(() => {
    if (step !== 3) return

    const poll = async () => {
      // attempt connectionState
      attempts.current += 1
      try {
        const res = await fetch(
          '/api/chats/whatsapp/instance/connectionState',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instanceName, apiKey }),
          },
        )
        if (res.ok) {
          const state: StateResponse = await res.json()
          if (state.status === 'connected') {
            clearTimeout(timeoutRef.current)
            setStep(4)
            return
          }
        }
      } catch {
        // ignore
      }

      // determine next delay:
      let delay: number
      if (attempts.current === 1) delay = 10
      else if (attempts.current === 2) delay = 20
      else delay = 30

      setCountdown(delay)
      timeoutRef.current = window.setTimeout(poll, delay * 1000)
    }

    // start first poll after 10s
    setCountdown(10)
    timeoutRef.current = window.setTimeout(poll, 10 * 1000)
    return () => clearTimeout(timeoutRef.current)
  }, [step, instanceName, apiKey])

  // send test message
  const handleSend = async () => {
    // ... same as previous version ...
  }

  return (
    <div className="wizard-container max-w-sm mx-auto">
      {step === 1 &&
        // ... phone input UI ...
        null}
      {step === 2 &&
        // ... spinner UI ...
        null}
      {step === 3 && (
        <div className="p-4 text-center flex flex-col gap-4">
          <p>Escaneie o QR Code abaixo para autenticar:</p>
          <img
            src={qrBase64 ? `data:image/png;base64,${qrBase64}` : qrCodeUrl}
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
      )}
      {step === 4 && (
        <div className="p-4 flex flex-col gap-2">
          <label htmlFor="destino" className="font-medium">
            Número de destino
          </label>
          <input
            id="destino"
            className="input"
            placeholder="(11) 98888-7777"
            value={maskPhone(destLocal)}
            onChange={handleDestChange}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            className="btn btn-primary mt-2"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar mensagem teste'}
          </button>
        </div>
      )}

      {step === 5 && sentOk && (
        <div className="p-4 text-center">
          <p>Mensagem padrão enviada com sucesso!</p>
        </div>
      )}
    </div>
  )
}
