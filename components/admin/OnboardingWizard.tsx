'use client'
import { useState, useEffect } from 'react'

export default function OnboardingWizard() {
  const [step, setStep] = useState<1|2|3|4>(1)
  const next = () => setStep(s => (s < 4 ? (s + 1) as 1|2|3|4 : s))
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(next, 2000)
      return () => clearTimeout(t)
    }
  }, [step])
  return (
    <div className="wizard-container">
      {step === 1 && (
        <div className="p-4 flex flex-col gap-2">
          <label className="font-medium">Telefone (E.164)</label>
          <input id="telefone" className="input" placeholder="5511999999999" />
          <button className="btn btn-primary mt-2" onClick={next}>
            Cadastrar
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
          <img src="/qrcode.png" alt="QR Code" className="mx-auto" />
          <button className="btn mt-4" onClick={next}>Avançar</button>
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
