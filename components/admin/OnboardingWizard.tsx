'use client'
import { useState, useEffect, useRef } from 'react'

type CheckResponse = {
  instanceName: string
  apiKey: string
  sessionStatus: 'pending' | 'connected' | 'disconnected'
} | null

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

type RawStateResponse = {
  instance?: { state?: string }
  state?: string
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

  const attempts = useRef(0)
  const timeoutRef = useRef<number>()
  const [countdown, setCountdown] = useState(0)
  const countdownInterval = useRef<number>()

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

  // 1) check initial
  useEffect(() => {
    const tenant = localStorage.getItem('tenantId') || ''
    console.log('[Onboarding] Iniciando check inicial, tenant:', tenant)
    ;(async () => {
      try {
        const res = await fetch('/api/chats/whatsapp/instance/check', {
          headers: { 'x-tenant-id': tenant },
        })
        console.log('[Onboarding] /instance/check status:', res.status)

        const chk = (await res.json()) as CheckResponse
        console.log('[Onboarding] check response:', chk)
        if (!chk) {
          console.log(
            '[Onboarding] nenhuma instância encontrada — permanece step 1',
          )
          return
        }

        console.log(
          '[Onboarding] instância encontrada:',
          chk.instanceName,
          'status:',
          chk.sessionStatus,
        )
        setInstanceName(chk.instanceName)
        setApiKey(chk.apiKey)

        if (chk.sessionStatus === 'connected') {
          console.log('[Onboarding] status connected — pulando para step 4')
          setStep(4)
        } else {
          console.log('[Onboarding] status pendente — indo para step 3 (QR)')
          setStep(3)
        }
      } catch (err) {
        console.error('[Onboarding] erro no check inicial:', err)
      }
    })()
  }, [])

  // 2) countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    countdownInterval.current = window.setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(countdownInterval.current)
  }, [countdown])

  // 3) polling on step 3
  useEffect(() => {
    if (step !== 3) return
    const tenant = localStorage.getItem('tenantId') || ''
    const poll = async () => {
      attempts.current++
      try {
        const res = await fetch(
          '/api/chats/whatsapp/instance/connectionState',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': tenant,
            },
            body: JSON.stringify({ instanceName, apiKey }),
          },
        )
        if (res.ok) {
          const raw = (await res.json()) as RawStateResponse
          const state = raw.instance?.state || raw.state
          if (state === 'open') {
            clearTimeout(timeoutRef.current)
            setStep(4)
            return
          }
          if (state === 'close') {
            clearTimeout(timeoutRef.current)
            setError('Sessão fechada – gere novo QR.')
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
  }, [step, instanceName, apiKey])

  // 4) create or regenerate QR
  const doGenerate = async (connectOnly = false) => {
    setError(undefined)
    const tenant = localStorage.getItem('tenantId') || ''
    if (!connectOnly) {
      const raw = telefoneLocal.replace(/\D/g, '')
      if (!/^\d{10,11}$/.test(raw)) {
        setError('Informe DDD + número válido.')
        return setStep(1)
      }
      setStep(2)
      setLoading(true)
      try {
        const res = await fetch('/api/chats/whatsapp/instance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenant,
          },
          body: JSON.stringify({ telefone: `55${raw}` }),
        })
        if (!res.ok) throw new Error((await res.json()).error || 'Erro')
        const d = (await res.json()) as RegisterResponse
        setInstanceName(d.instance.instanceName)
        setApiKey(d.apiKey)
        setQrCodeUrl(d.qrCodeUrl)
        setQrBase64(d.qrBase64) // ⚠️ usa d.qrBase64
        setStep(3)
      } catch (e: any) {
        setError(e.message)
        setStep(1)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const res = await fetch('/api/chats/whatsapp/instance/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenant,
          },
          body: JSON.stringify({ instanceName, apiKey }),
        })
        if (res.status === 404) {
          setError('Instância não encontrada; recrie.')
          return setStep(1)
        }
        if (!res.ok) throw new Error((await res.json()).error || 'Erro')
        const d = (await res.json()) as ConnectResponse
        setQrCodeUrl(d.qrCodeUrl)
        setQrBase64(d.qrBase64) // ⚠️ usa d.qrBase64
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
  }
  const handleRegister = () => doGenerate(false)
  const handleRegenerateQr = () => doGenerate(true)

  // 5) send test message
  const handleSend = async () => {
    const raw = destLocal.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(raw)) {
      setError('Destino inválido')
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch(
        `/api/chats/message/sendText/${instanceName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': localStorage.getItem('tenantId') || '',
          },
          body: JSON.stringify({
            to: `55${raw}`,
            message: 'Olá! QR autenticado com sucesso!',
          }),
        },
      )
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar')
      setSentOk(true)
      setStep(5)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wizard-container max-w-sm mx-auto">
      {step === 1 && (
        <div className="p-4 flex flex-col gap-2">
          <label className="font-medium">Telefone (DDD + número)</label>
          <input
            className="input"
            placeholder="(11) 99999-9999"
            value={maskPhone(telefoneLocal)}
            onChange={handleTelefoneChange}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            className="btn btn-primary mt-2"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Cadastrar'}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col items-center p-8">
          <span>Configurando sua instância...</span>
          <div className="animate-spin h-12 w-12 border-4 border-t-green-600 rounded-full" />
        </div>
      )}
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
