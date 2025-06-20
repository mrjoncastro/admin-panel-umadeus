/* @vitest-environment jsdom */
import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/atoms/Button'
import { expect, test } from 'vitest'

expect.extend(toHaveNoViolations)

test('Button is accessible', async () => {
  const { container } = render(<Button>Ok</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
