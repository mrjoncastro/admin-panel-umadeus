import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  className?: string;
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
    link: 'btn underline text-purple-600 hover:text-purple-700 bg-transparent',
  }[variant];

  return (
    <button className={`${variantClass} ${className}`.trim()} {...props} />
  );
}
