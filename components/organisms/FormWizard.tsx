import React, { useState } from 'react'

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

export default function FormWizard({ steps, onFinish, className = '' }: FormWizardProps) {
  const [current, setCurrent] = useState(0)
  const isLast = current === steps.length - 1

  const next = () => {
    if (isLast) onFinish?.()
    else setCurrent((c) => Math.min(c + 1, steps.length - 1))
  }

  const prev = () => setCurrent((c) => Math.max(c - 1, 0))

  return (
    <div className={className}>
      <div className="flex mb-4">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className={`flex-1 text-center py-2 border-b-2 ${i === current ? 'border-[var(--accent)]' : 'border-neutral-300'}`}
          >
            {s.title}
          </div>
        ))}
      </div>
      <div>{steps[current]?.content}</div>
      <div className="mt-4 flex justify-between">
        <button type="button" onClick={prev} disabled={current === 0} className="btn">
          Voltar
        </button>
        <button type="button" onClick={next} className="btn btn-primary">
          {isLast ? 'Concluir' : 'Avançar'}
        </button>
      </div>
    </div>
  )
}
