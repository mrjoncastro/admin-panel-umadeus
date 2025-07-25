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
