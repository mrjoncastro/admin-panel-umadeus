import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect, fn } from 'storybook/test'
import ModalVisualizarPedido from '../app/admin/inscricoes/componentes/ModalVisualizarPedido'
import { ThemeProvider } from '../lib/context/ThemeContext'

const meta = {
  title: 'Admin/ModalVisualizarPedido',
  component: ModalVisualizarPedido,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    pedidoId: '1',
    onClose: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModalVisualizarPedido>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Detalhes do Pedido/i)).toBeInTheDocument()
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
        <ModalVisualizarPedido {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <ModalVisualizarPedido {...args} />
      </TenantProvider>
    </div>
  ),
}
