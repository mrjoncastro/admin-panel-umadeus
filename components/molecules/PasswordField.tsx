import React, { useState } from 'react'
import { TextField } from '../atoms/TextField'
import { Eye, EyeOff } from 'lucide-react'

export interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export default function PasswordField({
  className = '',
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <TextField
        type={visible ? 'text' : 'password'}
        className={className}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
