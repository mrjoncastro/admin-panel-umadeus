// components/ToggleSwitch.tsx
'use client'
import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  className = '',
}: ToggleSwitchProps) {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
      }}
    >
      {label && <span className="text-sm font-medium">{label}</span>}
      <span className="relative inline-block w-12 h-7 align-middle">
        <input
          type="checkbox"
          className="peer opacity-0 w-0 h-0 absolute"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {/* Fundo do toggle */}
        <span
          className={`
            absolute top-0 left-0 w-12 h-7 rounded-full transition-colors duration-300
            ${
              checked
                ? 'bg-[var(--accent)]'
                : 'bg-neutral-300 dark:bg-neutral-700'
            }
            peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]
          `}
        ></span>
        {/* Bolinha */}
        <span
          className={`
            absolute top-0 left-0 w-7 h-7 bg-white border border-neutral-300 dark:border-neutral-700
            rounded-full shadow transition-transform duration-300
            ${checked ? 'translate-x-5' : ''}
          `}
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)' }}
        ></span>
        {/* Texto ON/OFF */}
        <span
          className={`
            absolute text-xs font-bold select-none transition-all pointer-events-none
            top-1 left-3
            ${
              checked
                ? 'text-[var(--accent)] opacity-90 left-7'
                : 'text-neutral-500 opacity-80 left-2'
            }
          `}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </span>
    </label>
  )
}
