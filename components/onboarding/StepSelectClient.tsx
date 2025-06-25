'use client'
import { useState } from 'react'
import { useOnboarding } from '@/lib/context/OnboardingContext'

interface StepSelectClientProps {
  onRegistered: (qrUrl: string, qrBase64: string) => void
}

export default function StepSelectClient({
  onRegistered,
}: StepSelectClientProps) {
  const { setStep, setInstanceName, setApiKey } = useOnboarding()
  const [telefoneLocal, setTelefoneLocal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const maskPhone = (digits: string) => {
    const d = digits.slice(0, 2)
    const n = digits.slice(2)
    let p1 = ''
    let p2 = ''
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

  const handleRegister = async () => {
    const raw = telefoneLocal.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(raw)) {
      setError('Informe DDD + número válido.')
      return
    }
    setStep(2)
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch('/api/chats/whatsapp/instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': localStorage.getItem('tenantId') || '',
        },
        body: JSON.stringify({ telefone: `55${raw}` }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro')
      const d = (await res.json()) as {
        instance: { instanceId: string; instanceName: string }
        apiKey: string
        qrCodeUrl: string
        qrBase64: string
      }
      setInstanceName(d.instance.instanceName)
      setApiKey(d.apiKey)
      onRegistered(d.qrCodeUrl, d.qrBase64)
      setStep(3)
    } catch (e: any) {
      setError(e.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
