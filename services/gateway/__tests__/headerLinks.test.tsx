/* @vitest-environment jsdom */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '@/components/templates/HeaderAdmin'
import { useAuthContext } from '@/lib/context/AuthContext'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
}))

vi.mock('@/lib/pocketbase', () => ({
  __esModule: true,
  default: vi.fn(() => ({ authStore: { clear: vi.fn() } })),
}))

vi.mock('@/lib/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

vi.mock('@/lib/context/TenantContext', () => ({
  useTenant: () => ({
    config: {
      logoUrl: '',
      font: '',
      primaryColor: '',
      confirmaInscricoes: true,
    },
  }),
}))

vi.mock('@/lib/context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

const mockedAuth = vi.mocked(useAuthContext)

describe('Header gerenciamento links', () => {
  it('mostra links para líderes', () => {
    mockedAuth.mockReturnValue({
      isLoggedIn: true,
      user: { role: 'lider', nome: 'A' },
    })
    render(<Header />)
    fireEvent.click(screen.getByText('Administração'))
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inscrições' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Usuários' })).toBeNull()
  })

  it('mostra links completos para coordenadores', () => {
    mockedAuth.mockReturnValue({
      isLoggedIn: true,
      user: { role: 'coordenador', nome: 'B' },
    })
    render(<Header />)
    fireEvent.click(screen.getByText('Administração'))
    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Campos' })).toBeInTheDocument()
  })
})
