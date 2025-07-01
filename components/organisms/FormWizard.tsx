'use client'
import React, { useState, useEffect, useRef } from 'react'
import LoadingOverlay from './LoadingOverlay'

export interface WizardStep {
  title: string
  content: React.ReactNode
}

interface FormWizardProps {
  steps: WizardStep[]
  onFinish?: () => void
  className?: string
  loading?: boolean
  onStepValidate?: (index: number) => Promise<boolean> | boolean
}

export default function FormWizard({
  steps,
  onFinish,
  className = '',
  loading = false,
  onStepValidate,
}: FormWizardProps) {
  const [current, setCurrent] = useState(0)
  const [message, setMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const isLast = current === steps.length - 1

  useEffect(() => {
    if (current === 0) setMessage('Vamos começar! Preencha os dados iniciais.')
    else if (current === steps.length - 1)
      setMessage('Último passo! Revise tudo e conclua.')
    else setMessage('Ótimo! Continue preenchendo as próximas informações.')
  }, [current, steps.length])

  const next = async () => {
    if (containerRef.current) {
      const inputs = containerRef.current.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input, select, textarea')
      for (const input of Array.from(inputs)) {
        if (typeof input.reportValidity === 'function' && !input.reportValidity()) {
          return
        }
      }
    }
    if (onStepValidate) {
      const ok = await onStepValidate(current)
      if (!ok) return
    }
    if (isLast) onFinish?.()
    else setCurrent((c) => Math.min(c + 1, steps.length - 1))
  }

  const prev = () => setCurrent((c) => Math.max(c - 1, 0))

  return (
    <div className={className}>
      <LoadingOverlay show={loading} text="Processando..." />
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
      <div ref={containerRef}>{steps[current]?.content}</div>
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={current === 0 || loading}
          className="btn"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={next}
          className="btn btn-primary"
          disabled={loading}
        >
          {isLast ? 'Concluir' : 'Avançar'}
        </button>
      </div>
    </div>
  )
}
