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
vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: () => ({ isLoggedIn: false, user: null, login }),
}))

vi.mock('@/utils/cep', () => ({
  fetchCep: vi.fn().mockResolvedValue({ street: '', neighborhood: '', city: '', state: '' }),
}))

describe('EventForm login', () => {
  it('chama login apos inscricao de novo usuario', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 'c1', nome: 'Campo 1' }]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ expand: { produto_inscricao: { id: 'p1', nome: 'Prod 1' } }, cobra_inscricao: false }),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

    const { container } = render(<EventForm eventoId="ev1" />)

    fireEvent.change(await screen.findByLabelText(/nome/i), { target: { value: 'Fulano' } })
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'f@x.com' } })
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '11999999999' } })
    fireEvent.change(screen.getByLabelText(/^cpf$/i), { target: { value: '52998224725' } })
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '2000-01-01' } })
    fireEvent.change(screen.getByLabelText(/gênero/i), { target: { value: 'masculino' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.change(await screen.findByLabelText(/cep/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText(/endereço/i), { target: { value: 'Rua A' } })
    fireEvent.change(screen.getByLabelText(/estado/i), { target: { value: 'SP' } })
    fireEvent.change(screen.getByLabelText(/cidade/i), { target: { value: 'São Paulo' } })
    fireEvent.change(screen.getByLabelText(/bairro/i), { target: { value: 'Centro' } })
    fireEvent.change(screen.getByLabelText(/número/i), { target: { value: '10' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.change(await screen.findByLabelText(/campo/i), { target: { value: 'c1' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(await screen.findByRole('button', { name: /prod 1/i }))
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.change(await screen.findByLabelText(/^senha$/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText(/confirme a senha/i), { target: { value: '12345678' } })
    fireEvent.click(screen.getByText(/avançar/i))

    fireEvent.click(container.querySelector('input[type="checkbox"]') as HTMLInputElement)
    fireEvent.click(screen.getByText(/concluir/i))

    await vi.waitFor(() => {
      expect(login).toHaveBeenCalledWith('f@x.com', '12345678')
    })
  })
})
