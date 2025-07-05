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
const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
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
  it(
    'envia inscricao com user.id e avanca o wizard',
    async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ expand: { produto_inscricao: { id: 'p1', nome: 'Prod 1' } }, cobra_inscricao: false }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))

    const { container } = render(<EventForm eventoId="ev1" />)

    fireEvent.change(await screen.findByLabelText(/nome/i), { target: { value: 'Fulano' } })
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'f@x.com' } })
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } })
    fireEvent.change(screen.getByLabelText(/^cpf$/i), { target: { value: '52998224725' } })
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '2000-01-01' } })
    fireEvent.change(screen.getByLabelText(/cep/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText(/endereço/i), { target: { value: 'Rua A' } })
    fireEvent.change(screen.getByLabelText(/estado/i), { target: { value: 'SP' } })
    fireEvent.change(screen.getByLabelText(/cidade/i), { target: { value: 'São Paulo' } })
    fireEvent.change(screen.getByLabelText(/bairro/i), { target: { value: 'Centro' } })
    fireEvent.change(screen.getByLabelText(/número/i), { target: { value: '10' } })
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'masculino' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'c1' } })
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText(/confirme a senha/i), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await vi.advanceTimersByTimeAsync(500)

    fireEvent.change(await screen.findByLabelText(/campo/i), { target: { value: 'c1' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(await screen.findByRole('button', { name: /prod 1/i }))
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(container.querySelector('input[type="checkbox"]') as HTMLInputElement)
    fireEvent.click(screen.getByText(/concluir/i))

    await vi.waitFor(() => {
      expect(login).toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledTimes(4)
    })

    const body = JSON.parse((fetchMock.mock.calls[3][1] as RequestInit).body as string)
    expect(body.userId).toBe('u1')

    vi.useRealTimers()
  })

  it('redireciona para conclusao apos envio com sucesso', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ expand: { produto_inscricao: { id: 'p1', nome: 'Prod 1' } }, cobra_inscricao: false }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

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

    const { container } = render(<EventForm eventoId="ev1" />)

    fireEvent.change(await screen.findByLabelText(/gênero/i), { target: { value: 'masculino' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.change(await screen.findByLabelText(/campo/i), { target: { value: 'c1' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(await screen.findByRole('button', { name: /prod 1/i }))
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(container.querySelector('input[type="checkbox"]') as HTMLInputElement)
    fireEvent.click(screen.getByText(/concluir/i))

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(4)
    })
    expect(replace).toHaveBeenCalledWith('/inscricoes/conclusao')

    vi.useRealTimers()
  })
})
