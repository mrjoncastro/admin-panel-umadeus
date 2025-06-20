import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { within, userEvent, expect } from 'storybook/test'
import LoadingOverlay from '../components/organisms/LoadingOverlay'

const meta = {
  title: 'Design System/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { show: true, text: 'Carregando...' },
  render: (args) => {
    const [show, setShow] = useState(args.show)
    return (
      <div>
        <button onClick={() => setShow(!show)} className="btn btn-primary mb-4">
          Toggle
        </button>
        <LoadingOverlay {...args} show={show} />
      </div>
    )
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('button', { name: /toggle/i })
    await expect(canvas.getByText(args.text as string)).toBeInTheDocument()
    await userEvent.click(toggle)
    await expect(
      canvas.queryByText(args.text as string),
    ).not.toBeInTheDocument()
    await userEvent.click(toggle)
    await expect(canvas.getByText(args.text as string)).toBeInTheDocument()
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
        <LoadingOverlay {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <LoadingOverlay {...args} />
      </TenantProvider>
    </div>
  ),
}
