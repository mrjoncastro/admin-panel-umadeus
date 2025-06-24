import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import ToggleSwitch from '../components/atoms/ToggleSwitch'
import { TenantProvider } from '../lib/context/TenantContext'

const meta = {
  title: 'Design System/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  args: { checked: false, label: 'Ativo' },
} satisfies Meta<typeof ToggleSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { checked: false, label: 'Ativo', onChange: () => {} },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked)
    return <ToggleSwitch {...args} checked={checked} onChange={setChecked} />
  },
}

export const TemaDinamico: Story = {
  args: { checked: false, label: 'Ativo', onChange: () => {} },
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
        <ToggleSwitch {...args} onChange={() => {}} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: 'https://placehold.co/120x120',
          confirmaInscricoes: false,
        }}
      >
        <ToggleSwitch {...args} onChange={() => {}} />
      </TenantProvider>
    </div>
  ),
}
