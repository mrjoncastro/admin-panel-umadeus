import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect, fn } from 'storybook/test'
import ListaClientes from '../app/admin/clientes/components/ListaClientes'
import { ThemeProvider } from '../lib/context/ThemeContext'
import type { Inscricao } from '../types'

const exemplo: Inscricao = {
  id: '1',
  nome: 'João da Silva',
  telefone: '11999999999',
  status: 'confirmado',
  produto: 'Kit Camisa + Pulseira',
  genero: 'masculino',
  evento: 'Conf 2025',
  criado_por: '1',
  campo: '1',
  cpf: '12345678900',
  email: 'joao@example.com',
  expand: {
    pedido: {
      id: '10',
      status: 'pago',
      valor: '150',
    },
  },
}

const meta = {
  title: 'Admin/ListaClientes',
  component: ListaClientes,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    clientes: [exemplo],
    onEdit: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ListaClientes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/João da Silva/i)).toBeInTheDocument()
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
        <ListaClientes {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <ListaClientes {...args} />
      </TenantProvider>
    </div>
  ),
}
