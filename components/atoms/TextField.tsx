import React from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function TextField({ className = '', ...props }: TextFieldProps) {
  return <input className={`input-base ${className}`.trim()} {...props} />;
}
