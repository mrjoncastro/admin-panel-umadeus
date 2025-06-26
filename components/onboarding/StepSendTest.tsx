'use client'
import { useState } from 'react'
import { TextField } from '@/components/atoms/TextField'
import { Button } from '@/components/atoms/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import { maskPhone } from '@/utils/formatPhone'

export default function StepSendTest() {
  const { instanceName, setStep, loading, setLoading } = useOnboarding()
  const { tenantId } = useAuthContext()
  const [telefoneLocal, setTelefoneLocal] = useState('')
  const [error, setError] = useState<string>()


  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let r = e.target.value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)
    setTelefoneLocal(r)
  }

  const handleSendTest = async () => {
    const raw = telefoneLocal.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(raw)) {
      setError('Informe DDD + número válido.')
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
            'x-tenant-id': tenantId!,
          },
          body: JSON.stringify({ to: `55${raw}` }),
        },
      )
      if (res.status === 409) {
        setError('Teste já executado')
        return
      }
      if (!res.ok) throw new Error(await res.text())
      setStep(5)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 flex flex-col gap-2">
      <label className="font-medium">Número de teste (DDD + número)</label>
      <TextField
        className="input-base"
        placeholder="(11) 99999-9999"
        value={maskPhone(telefoneLocal)}
        onChange={handleTelefoneChange}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button className="mt-2" onClick={handleSendTest} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Mensagem'}
      </Button>
    </div>
  )
}
