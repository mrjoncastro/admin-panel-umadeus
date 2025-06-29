import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`card ${className}`.trim()} {...props} />
}
