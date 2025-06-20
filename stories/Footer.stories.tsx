import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect } from 'storybook/test'
import Footer from '../components/templates/Footer'
import { AuthProvider } from '../lib/context/AuthContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Admin/Footer',
  component: Footer,
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
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/UMADEUS/i)).toBeInTheDocument()
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
        <Footer {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <Footer {...args} />
      </TenantProvider>
    </div>
  ),
}
