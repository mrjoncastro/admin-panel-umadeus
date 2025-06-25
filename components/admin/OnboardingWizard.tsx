'use client'
import { useState } from 'react'

type ApiResponse = {
  instance: { instanceId: string; instanceName: string }
  apiKey: string
  pairingCode: string
  qrCodeUrl: string // URL pública do arquivo enviado ao PB
  qrBase64: string // Base64 puro, sem prefixo
}

export default function OnboardingWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [telefoneLocal, setTelefoneLocal] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formata em (##) ####-#### ou (##) #####-####
  const formatPhoneMask = (digits: string) => {
    const ddd = digits.slice(0, 2)
    const number = digits.slice(2)
    let part1: string, part2: string

    if (number.length <= 4) {
      part1 = number
      part2 = ''
    } else if (number.length <= 8) {
      part1 = number.slice(0, 4)
      part2 = number.slice(4)
    } else {
      part1 = number.slice(0, 5)
      part2 = number.slice(5)
    }

    return `(${ddd}) ${part1}${part2 ? '-' + part2 : ''}`
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.currentTarget.value.replace(/\D/g, '')
    if (raw.length > 11) raw = raw.slice(0, 11)
    setTelefoneLocal(raw)
  }

  const handleRegister = async () => {
    // limpa máscara
    const rawPhone = telefoneLocal.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(rawPhone)) {
      setError('Informe DDD + número (10 ou 11 dígitos).')
      return
    }

    setError(null)
    setStep(2)
    setLoading(true)

    // monta E.164
    const fullNumber = `55${rawPhone}`

    try {
      const res = await fetch('/api/chats/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: fullNumber }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erro desconhecido')
      }

      const data: ApiResponse = await res.json()
      setQrCodeUrl(data.qrCodeUrl)
      setQrBase64(data.qrBase64)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s))

  return (
    <div className="wizard-container max-w-sm mx-auto">
      {step === 1 && (
        <div className="p-4 flex flex-col gap-2">
          <label htmlFor="telefone" className="font-medium">
            Telefone (DDD + número)
          </label>
          <input
            id="telefone"
            className="input"
            placeholder="(11) 99999-9999"
            value={formatPhoneMask(telefoneLocal)}
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
        <div className="p-4 text-center">
          <p>Escaneie o QR Code abaixo para autenticar:</p>
          <img
            src={
              qrBase64
                ? `data:image/png;base64,${qrBase64}`
                : qrCodeUrl || undefined
            }
            alt="QR Code"
            className="mx-auto"
          />
          <button className="btn mt-4" onClick={next}>
            Avançar
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="p-4 text-center">
          <p>Mensagem de teste enviada!</p>
        </div>
      )}
    </div>
  )
}
