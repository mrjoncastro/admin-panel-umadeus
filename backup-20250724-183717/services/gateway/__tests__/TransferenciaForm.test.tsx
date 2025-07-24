/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi, expectTypeOf } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type {
  ClienteContaBancariaRecord,
  PixKeyRecord,
} from '../lib/bankAccounts'
import TransferenciaForm from '@/app/admin/financeiro/transferencias/components/TransferenciaForm'

vi.mock('../lib/context/AuthContext', () => ({
  useAuthContext: () => ({ tenantId: 'cli1' }),
}))

let contasMock: ClienteContaBancariaRecord[]
let pixMock: PixKeyRecord[]
vi.mock('../lib/bankAccounts', () => {
  contasMock = [
    { id: '1', accountName: 'Conta 1', ownerName: 'Fulano' },
    { id: '2', accountName: 'Conta 2', ownerName: 'Beltrano' },
  ]
  pixMock = [{ id: '3', pixAddressKey: 'a@b.com', pixAddressKeyType: 'email' }]
  return {
    fetchBankAccounts: vi.fn().mockResolvedValue(contasMock),
    fetchPixKeys: vi.fn().mockResolvedValue(pixMock),
  }
})

describe('TransferenciaForm', () => {
  it('renderiza contas bancarias e chaves pix', async () => {
    render(<TransferenciaForm />)
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(1 + contasMock.length + pixMock.length)
    expect(options[1].textContent).toContain('Conta 1')
    expect(options[2].textContent).toContain('Conta 2')
    expect(options[3].textContent).toContain('PIX')
    expectTypeOf(contasMock).toEqualTypeOf<ClienteContaBancariaRecord[]>()
    expectTypeOf(pixMock).toEqualTypeOf<PixKeyRecord[]>()
  })

  it('exibe campo de descrição ao selecionar PIX', async () => {
    render(<TransferenciaForm />)
    const select = await screen.findByRole('combobox')
    fireEvent.change(select, { target: { value: '3' } })
    expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument()
  })
})
