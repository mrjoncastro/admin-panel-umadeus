/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
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

  it('executa onStepValidate e bloqueia avanço quando retorna false', async () => {
    const validate = vi.fn().mockResolvedValue(false)
    render(
      <FormWizard
        onStepValidate={validate}
        steps={[
          { title: 'Um', content: <input required placeholder="a" /> },
          { title: 'Dois', content: <div>Etapa 2</div> },
        ]}
      />,
    )

    fireEvent.click(screen.getByText('Avançar'))

    await vi.waitFor(() => {
      expect(validate).toHaveBeenCalledWith(0)
    })

    expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument()
  })

  it('desabilita botão enquanto validação está pendente', async () => {
    let resolveFn: (v: boolean) => void = () => {}
    const validate = vi.fn().mockImplementation(
      () => new Promise<boolean>((res) => {
        resolveFn = res
      }),
    )
    render(
      <FormWizard
        onStepValidate={validate}
        steps={[
          { title: 'Um', content: <input required placeholder="a" /> },
          { title: 'Dois', content: <div>Etapa 2</div> },
        ]}
      />,
    )

    const button = screen.getByText('Avançar')
    fireEvent.click(button)
    expect(button).toBeDisabled()
    resolveFn(true)
    await vi.waitFor(() => expect(button).not.toBeDisabled())
  })
})
