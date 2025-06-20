import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, userEvent, expect } from 'storybook/test'
import TransferenciaForm from '../app/admin/financeiro/transferencias/components/TransferenciaForm'
import type { PixKeyRecord } from '../lib/bankAccounts'

const meta = {
  title: 'Design System/TransferenciaForm',
  component: TransferenciaForm,
  tags: ['autodocs'],
  argTypes: {
    onTransfer: { action: 'onTransfer' },
  },
} satisfies Meta<typeof TransferenciaForm>

export default meta
type Story = StoryObj<typeof meta>

export const Sucesso: Story = {
  args: {
    onTransfer: async (
      _d: string,
      _v: number,
      _desc: string,
      _isPix: boolean,
      _pix?: PixKeyRecord,
    ) => {},
  },
}

export const ErroTransferencia: Story = {
  args: {
    onTransfer: async (
      _d: string,
      _v: number,
      _desc: string,
      _isPix: boolean,
      _pix?: PixKeyRecord,
    ) => {
      throw new Error('fail')
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByPlaceholderText(/destinat\u00e1rio/i),
      'user',
    )
    await userEvent.type(canvas.getByPlaceholderText(/valor/i), '10')
    await userEvent.click(canvas.getByRole('button', { name: /transferir/i }))
    await expect(canvas.getByText(/erro ao transferir/i)).toBeInTheDocument()
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
        <TransferenciaForm {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <TransferenciaForm {...args} />
      </TenantProvider>
    </div>
  ),
}
