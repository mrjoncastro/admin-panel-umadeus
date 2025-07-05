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

let currentUser: any = null
const login = vi.fn().mockImplementation(async () => {
  currentUser = {
    id: 'u1',
    nome: 'Fulano',
    email: 'f@x.com',
    telefone: '11999999999',
    cpf: '52998224725',
    data_nascimento: '2000-01-01',
    genero: 'masculino',
    cep: '12345678',
    endereco: 'Rua A',
    numero: '10',
    bairro: 'Centro',
    estado: 'SP',
    cidade: 'São Paulo',
  }
})
const signUp = vi.fn().mockImplementation(async () => {
  await login()
})

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({
    isLoggedIn: !!currentUser,
    user: currentUser,
    login,
    signUp,
  }),
}))

vi.mock('@/utils/cep', () => ({
  fetchCep: vi.fn().mockResolvedValue({ street: '', neighborhood: '', city: '', state: '' }),
}))

describe('EventForm signup flow', () => {
  it('avanca primeira etapa do wizard', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ expand: { produto_inscricao: { id: 'p1', nome: 'Prod 1' } }, cobra_inscricao: false }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })

    render(<EventForm eventoId="ev1" />)

    fireEvent.change(await screen.findByLabelText(/nome/i), { target: { value: 'Fulano' } })
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'f@x.com' } })
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } })
    fireEvent.change(screen.getByLabelText(/^cpf$/i), { target: { value: '52998224725' } })
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '2000-01-01' } })
    fireEvent.change(screen.getByLabelText(/gênero/i), { target: { value: 'masculino' } })
    fireEvent.click(screen.getByText(/avançar/i))

    expect(await screen.findByLabelText(/cep/i)).toBeInTheDocument()
  })
})
