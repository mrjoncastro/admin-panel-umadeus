/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BankAccountModal from '@/app/admin/financeiro/transferencias/modals/BankAccountModal'

vi.mock('../lib/context/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1', cliente: 'cli1' } }),
}))

let createBankAccountApi: ReturnType<typeof vi.fn>
let createPixKeyApi: ReturnType<typeof vi.fn>
let searchBanks: ReturnType<typeof vi.fn>

vi.mock('../lib/bankAccounts', () => {
  createBankAccountApi = vi.fn()
  createPixKeyApi = vi.fn()
  searchBanks = vi.fn().mockResolvedValue([])
  return {
    searchBanks,
    createBankAccountApi,
    createPixKeyApi,
  }
})

function fillBasicFields(container: HTMLElement, cpf: string, birth: string) {
  fireEvent.change(screen.getByPlaceholderText('Nome do titular'), {
    target: { value: 'Fulano' },
  })
  fireEvent.change(screen.getByPlaceholderText('Nome da conta'), {
    target: { value: 'Conta' },
  })
  fireEvent.change(screen.getByPlaceholderText('CPF/CNPJ'), {
    target: { value: cpf },
  })
  const date = container.querySelectorAll(
    'input[type="date"]',
  )[0] as HTMLInputElement
  fireEvent.change(date, { target: { value: birth } })
}

describe('BankAccountModal validations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra erro quando cpf/cnpj inválido', async () => {
    const { container } = render(<BankAccountModal open onClose={() => {}} />)
    fillBasicFields(container, '123', '2000-01-01')
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    expect(await screen.findByText('CPF/CNPJ inválido.')).toBeInTheDocument()
    expect(createBankAccountApi).not.toHaveBeenCalled()
  })

  it('mostra erro quando data inválida', async () => {
    const { container } = render(<BankAccountModal open onClose={() => {}} />)
    fillBasicFields(container, '93541134780', '2023-13-01')
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    expect(
      await screen.findByText('Data de nascimento inválida.'),
    ).toBeInTheDocument()
    expect(createBankAccountApi).not.toHaveBeenCalled()
  })
})
