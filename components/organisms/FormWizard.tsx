'use client'
import React, { useState, useEffect } from 'react'

export interface WizardStep {
  title: string
  content: React.ReactNode
}

interface FormWizardProps {
  steps: WizardStep[]
  onFinish?: () => void
  className?: string
  loading?: boolean
}

export default function FormWizard({
  steps,
  onFinish,
  className = '',
}: FormWizardProps) {
  const [current, setCurrent] = useState(0)
  const [message, setMessage] = useState('')
  const isLast = current === steps.length - 1

  useEffect(() => {
    if (current === 0) setMessage('Vamos começar! Preencha os dados iniciais.')
    else if (current === steps.length - 1)
      setMessage('Último passo! Revise tudo e conclua.')
    else setMessage('Ótimo! Continue preenchendo as próximas informações.')
  }, [current, steps.length])

  const next = () => {
    if (isLast) onFinish?.()
    else setCurrent((c) => Math.min(c + 1, steps.length - 1))
  }

  const prev = () => setCurrent((c) => Math.max(c - 1, 0))

  return (
    <div className={className}>
      <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
        <div
          className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="text-center mb-1 text-sm text-neutral-600">
        Passo {current + 1} de {steps.length}
      </div>
      {message && (
        <div className="text-center mb-4 text-sm text-muted-foreground italic">
          {message}
        </div>
      )}
      <div>{steps[current]?.content}</div>
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          className="btn"
        >
          Voltar
        </button>
        <button type="button" onClick={next} className="btn btn-primary">
          {isLast ? 'Concluir' : 'Avançar'}
        </button>
      </div>
    </div>
  )
}
