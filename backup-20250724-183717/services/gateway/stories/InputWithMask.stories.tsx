import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { InputWithMask } from '../components/molecules/InputWithMask'
import { TenantProvider } from '../lib/context/TenantContext'

const meta = {
  title: 'Design System/InputWithMask',
  component: InputWithMask,
  tags: ['autodocs'],
  args: { mask: 'cpf' },
} satisfies Meta<typeof InputWithMask>

export default meta
type Story = StoryObj<typeof meta>

export const CPF: Story = {
  args: { mask: 'cpf' },
  render: (args) => {
    const [value, setValue] = useState('52998224725')
    return (
      <InputWithMask
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}

export const Telefone: Story = {
  args: { mask: 'telefone' },
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <InputWithMask
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}

export const TemaDinamico: Story = {
  args: { mask: 'cpf' },
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
        <InputWithMask {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <InputWithMask {...args} />
      </TenantProvider>
    </div>
  ),
}
