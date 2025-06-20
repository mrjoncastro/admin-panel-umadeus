import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect } from 'storybook/test'
import LayoutWrapper from '../components/templates/LayoutWrapperAdmin'
import { AuthProvider } from '../lib/context/AuthContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Admin/LayoutWrapper',
  component: LayoutWrapper,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    children: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LayoutWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Conteúdo de exemplo',
  },
  render: ({ children }) => (
    <LayoutWrapper>
      <p>{children}</p>
    </LayoutWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(args.children as string)).toBeInTheDocument()
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
        <LayoutWrapper {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <LayoutWrapper {...args} />
      </TenantProvider>
    </div>
  ),
}
