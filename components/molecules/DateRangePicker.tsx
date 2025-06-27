import React from 'react'
import { FormField } from './FormField'
import { TextField } from '../atoms/TextField'

export interface DateRangePickerProps {
  start: string
  end: string
  onChange: (range: { start: string; end: string }) => void
  className?: string
  dataTourStart?: string
  dataTourEnd?: string
}

export default function DateRangePicker({
  start,
  end,
  onChange,
  className = '',
  dataTourStart,
  dataTourEnd,
}: DateRangePickerProps) {
  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ start: e.target.value, end })
  }
  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ start, end: e.target.value })
  }
  return (
    <div className={`flex gap-2 ${className}`.trim()}>
      <FormField label="Início" htmlFor="start" className="flex-1">
        <TextField
          id="start"
          type="date"
          value={start}
          onChange={handleStart}
          data-tour={dataTourStart}
        />
      </FormField>
      <FormField label="Fim" htmlFor="end" className="flex-1">
        <TextField
          id="end"
          type="date"
          value={end}
          onChange={handleEnd}
          data-tour={dataTourEnd}
        />
      </FormField>
    </div>
  )
}
