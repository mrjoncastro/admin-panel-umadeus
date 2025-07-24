'use client'
import { useState } from 'react'
import { TextField } from '@/components/atoms/TextField'
import { Button } from '@/components/atoms/Button'
import { useOnboarding } from '@/lib/context/OnboardingContext'
import { maskPhone } from '@/utils/formatPhone'

export default function StepSelectClient() {
  const { setStep, setTelefone } = useOnboarding()
  const [telefoneLocal, setTelefoneLocal] = useState('')
  const [error, setError] = useState<string>()

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let r = e.target.value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)
    setTelefoneLocal(r)
  }

  const handleRegister = () => {
    const raw = telefoneLocal.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(raw)) {
      setError('Informe DDD + número válido.')
      return
    }
    setError(undefined)
    setTelefone(raw)
    setStep(2)
  }

  return (
    <div className="card p-4 flex flex-col gap-2">
      <label className="font-medium">Telefone (DDD + número)</label>
      <TextField
        className="input-base"
        placeholder="(11) 99999-9999"
        value={maskPhone(telefoneLocal)}
        onChange={handleTelefoneChange}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button className="mt-2" onClick={handleRegister}>
        Cadastrar
      </Button>
    </div>
  )
}
