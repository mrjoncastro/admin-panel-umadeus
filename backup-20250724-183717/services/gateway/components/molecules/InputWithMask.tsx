import React, { useEffect, useState, useCallback } from 'react'
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
  value,
  ...props
}: InputWithMaskProps) {
  const applyMask = useCallback(
    (val: string) => {
      if (mask === 'cpf') {
        return val
          .replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
      if (mask === 'telefone') {
        return val
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .replace(/(-\d{4})\d+?$/, '$1')
      }
      return val
    },
    [mask],
  )
  const [maskedValue, setMaskedValue] = useState(() =>
    applyMask(String(value ?? '')),
  )

  useEffect(() => {
    setMaskedValue(applyMask(String(value ?? '')))
  }, [value, applyMask])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyMask(e.target.value)
    setMaskedValue(val)
    e.target.value = val
    onChange?.(e)
  }

  return (
    <TextField
      className={className}
      value={maskedValue}
      onChange={handleChange}
      {...props}
    />
  )
}
