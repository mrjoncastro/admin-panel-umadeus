'use client'
import { useState } from 'react'
import { useOnboarding } from '@/lib/context/OnboardingContext'

export default function StepSendTest() {
  const { instanceName, setStep } = useOnboarding()
  const [destLocal, setDestLocal] = useState('')
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

  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let r = e.target.value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)
    setDestLocal(r)
  }

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
        `/api/chats/whatsapp/message/sendTest/${instanceName}`,
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
      if (res.status === 409) {
        return setStep(5)
      }
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar')
      setStep(5)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
