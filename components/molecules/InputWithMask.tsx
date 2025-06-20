import React from 'react'
import { TextField } from '../atoms/TextField'

export interface InputWithMaskProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'cpf' | 'telefone'
  className?: string
}

export function InputWithMask({
  mask,
  className = '',
  onChange,
  ...props
}: InputWithMaskProps) {
  const applyMask = (value: string) => {
    if (mask === 'cpf') {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    if (mask === 'telefone') {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
    return value
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = applyMask(e.target.value)
    e.target.value = value
    onChange?.(e)
  }

  return <TextField className={className} onChange={handleChange} {...props} />
}
