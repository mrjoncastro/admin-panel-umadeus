import React, { useState } from 'react'
import { TextField } from '../atoms/TextField'
import { Eye, EyeOff } from 'lucide-react'

export interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  /**
   * Exibe a mensagem de validação de tamanho mínimo.
   * Por padrão, true para formularios de cadastro.
   */
  showValidation?: boolean
}

export default function PasswordField({
  className = '',
  showValidation = true,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const [touched, setTouched] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showValidation) setTouched(true)
    props.onChange?.(e)
  }

  const value = (props.value ?? '').toString()
  const isValid = value.length >= 8

  return (
    <div className="space-y-1">
      <div className="relative">
        <TextField
          type={visible ? 'text' : 'password'}
          className={className}
          {...props}
          onChange={handleChange}
        />
        <button
          type="button"
          aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {showValidation && touched && (
        <p
          className={`text-sm ${isValid ? 'text-green-600' : 'text-error-600'}`.trim()}
        >
          {isValid
            ? 'Senha válida ✅'
            : 'A senha precisa ter pelo menos 8 caracteres.'}
        </p>
      )}
    </div>
  )
}
