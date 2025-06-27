/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FormWizard from '@/components/organisms/FormWizard'

describe('FormWizard', () => {
  it('nao avanca se campos obrigatorios vazios', () => {
    render(
      <FormWizard
        steps={[
          { title: 'Um', content: <input required placeholder="a" /> },
          { title: 'Dois', content: <div>Etapa 2</div> },
        ]}
      />,
    )

    fireEvent.click(screen.getByText('Avançar'))

    expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument()
  })
})
