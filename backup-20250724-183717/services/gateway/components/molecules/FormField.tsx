import React from 'react'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block font-medium text-sm mb-1">
        {label}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-sm text-error-600">
          {error}
        </span>
      )}
    </div>
  )
}
