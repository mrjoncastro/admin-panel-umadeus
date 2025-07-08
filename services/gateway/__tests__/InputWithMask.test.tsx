/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InputWithMask } from '../components/molecules/InputWithMask'

describe('InputWithMask', () => {
  it('aplica mascara no valor inicial e nas mudancas', () => {
    const handleChange = vi.fn()
    render(
      <InputWithMask mask="cpf" value="52998224725" onChange={handleChange} />,
    )
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('529.982.247-25')

    fireEvent.change(input, { target: { value: '93541134780' } })
    expect(input.value).toBe('935.411.347-80')
    expect(handleChange).toHaveBeenCalled()
    const event = handleChange.mock
      .calls[0][0] as React.ChangeEvent<HTMLInputElement>
    expect(event.target.value).toBe('935.411.347-80')
  })
})
