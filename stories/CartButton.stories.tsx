import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import CartButton from '../app/components/CartButton'
import { CartProvider } from '../lib/context/CartContext'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Components/CartButton',
  component: CartButton,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <CartProvider>
          <Story />
        </CartProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CartButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

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
        <CartButton {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <CartButton {...args} />
      </TenantProvider>
    </div>
  ),
}
