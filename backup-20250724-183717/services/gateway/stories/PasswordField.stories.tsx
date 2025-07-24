import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { PasswordField } from '../components/molecules'
import { TenantProvider } from '../lib/context/TenantContext'

const meta = {
  title: 'Design System/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <PasswordField
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}

export const TemaDinamico: Story = {
  render: (args) => (
    <div className="space-y-4">
      <TenantProvider
        initialConfig={{
          primaryColor: '#2563eb',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <PasswordField {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <PasswordField {...args} />
      </TenantProvider>
    </div>
  ),
}
