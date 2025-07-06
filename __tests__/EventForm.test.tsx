/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import EventForm from '@/components/organisms/EventForm'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}))

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/context/TenantContext', () => ({
  useTenant: () => ({ config: { confirmaInscricoes: true } }),
}))

vi.mock('@/lib/context/ToastContext', () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}))

const login = vi.fn()
const signUp = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ isLoggedIn: false, user: null, login, signUp }),
}))

vi.mock('@/utils/cep', () => ({
  fetchCep: vi
    .fn()
    .mockResolvedValue({ street: '', neighborhood: '', city: '', state: '' }),
}))

describe('EventForm login', () => {
  it('renderiza campos de CPF e email preenchidos', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            expand: { produto_inscricao: { id: 'p1', nome: 'Prod 1' } },
            cobra_inscricao: false,
          }),
      })

    render(
      <EventForm
        eventoId="ev1"
        initialCpf="52998224725"
        initialEmail="f@x.com"
      />,
    )

    await screen.findByDisplayValue('529.982.247-25')
    const emailInput = screen.getByDisplayValue('f@x.com') as HTMLInputElement
    const cpfInput = screen.getByDisplayValue(
      '529.982.247-25',
    ) as HTMLInputElement
    expect(emailInput).toHaveAttribute('readonly')
    expect(cpfInput).toHaveAttribute('readonly')
  })
})
