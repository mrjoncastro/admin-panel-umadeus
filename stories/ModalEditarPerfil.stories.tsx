import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect, fn } from 'storybook/test'
import ModalEditarPerfil from '../app/admin/perfil/components/ModalEditarPerfil'
import { AuthProvider } from '../lib/context/AuthContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Admin/ModalEditarPerfil',
  component: ModalEditarPerfil,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  args: {
    onClose: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModalEditarPerfil>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Editar Perfil/i)).toBeInTheDocument()
    await expect(canvas.getByLabelText(/nome completo/i)).toBeInTheDocument()
  },
}

export const TemaDinamico: Story = {
  render: (args) => (
    <div className=\"space-y-4\">
      <TenantProvider
        initialConfig={{
          primaryColor: '#2563eb',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <ModalEditarPerfil {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <ModalEditarPerfil {...args} />
      </TenantProvider>
    </div>
  ),
}
