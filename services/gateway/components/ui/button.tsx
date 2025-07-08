import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variantClass = {
      primary: 'btn btn-primary',
      secondary: 'btn btn-secondary',
      danger: 'btn btn-danger',
    }[variant]
    return (
      <button ref={ref} className={cn(variantClass, className)} {...props} />
    )
  },
)
Button.displayName = 'Button'
