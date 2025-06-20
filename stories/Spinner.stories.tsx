import type { Meta, StoryObj } from '@storybook/nextjs'
import Spinner from '../components/atoms/Spinner'
import { TenantProvider } from '../lib/context/TenantContext'

const meta = {
  title: 'Design System/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    className: 'w-8 h-8 text-primary-600',
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomSize: Story = {
  args: {
    className: 'w-12 h-12 text-primary-500',
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
        <Spinner {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <Spinner {...args} />
      </TenantProvider>
    </div>
  ),
}
