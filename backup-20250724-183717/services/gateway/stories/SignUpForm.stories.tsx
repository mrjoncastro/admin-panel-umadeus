import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect } from 'storybook/test'
import CreateUserForm from '@/components/templates/CreateUserForm'
import { AuthProvider } from '../lib/context/AuthContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Components/CreateUserForm',
  component: CreateUserForm,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CreateUserForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: /criar conta/i }),
    ).toBeInTheDocument()
    await expect(canvas.getByLabelText(/nome completo/i)).toBeInTheDocument()
    await expect(canvas.getByLabelText(/bairro/i)).toBeInTheDocument()
  },
}
