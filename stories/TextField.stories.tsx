import type { Meta, StoryObj } from '@storybook/nextjs'
import { TextField } from '../components/atoms/TextField'
import { TenantProvider } from '../lib/context/TenantContext'

const meta = {
  title: 'Design System/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { placeholder: 'Digite aqui' },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TemaDinamico: Story = {
  render: (args) => (
    <div className="space-y-4">
      <TenantProvider
        initialConfig={{
          primaryColor: '#2563eb',
          font: 'var(--font-geist)',
          logoUrl: 'https://placehold.co/120x120',
          confirmaInscricoes: false,
        }}
      >
        <TextField {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: 'https://placehold.co/120x120',
          confirmaInscricoes: false,
        }}
      >
        <TextField {...args} />
      </TenantProvider>
    </div>
  ),
}
