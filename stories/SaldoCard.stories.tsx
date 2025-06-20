import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import SaldoCard from '../components/molecules/SaldoCard'

const meta = {
  title: 'Design System/SaldoCard',
  component: SaldoCard,
  tags: ['autodocs'],
  args: { saldo: 1200.5 },
} satisfies Meta<typeof SaldoCard>

export default meta
type Story = StoryObj<typeof meta>

export const ComSaldo: Story = {}

export const SemSaldo: Story = {
  args: { saldo: 0 },
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
        <SaldoCard {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <SaldoCard {...args} />
      </TenantProvider>
    </div>
  ),
}
