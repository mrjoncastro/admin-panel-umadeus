import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect } from 'storybook/test';
import DashboardAnalytics from '../app/admin/components/DashboardAnalytics';
import { ThemeProvider } from '../lib/context/ThemeContext';
import { Pedido } from '@/types';

const meta = {
  title: 'Admin/DashboardAnalytics',
  component: DashboardAnalytics,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    inscricoes: { control: 'object' },
    pedidos: { control: 'object' },
    mostrarFinanceiro: { control: 'boolean' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    inscricoes: [
      { id: '1', created: '2024-01-01', nome: 'João', telefone: '11999999999' },
      { id: '2', created: '2024-01-02', nome: 'Maria', telefone: '11988888888' },
    ],
    pedidos: [
      {
        id: '1',
        created: '2024-01-01',
        valor: '100',
        status: 'pago',
        expand: {
          campo: { id: '1', nome: 'Campo 1' },
        },
        updated: '2024-01-01',
        user: 'user1',
        // Adicione outros campos obrigatórios do tipo Pedido aqui se necessário
      } as unknown as Pedido,
      {
        id: '2',
        created: '2024-01-02',
        valor: '50',
        status: 'pago',
        expand: {
          campo: { id: '1', nome: 'Campo 1' },
        },
        updated: '2024-01-02',
        user: 'user2',
        // Adicione outros campos obrigatórios do tipo Pedido aqui se necessário
      } as unknown as Pedido,
    ],
    mostrarFinanceiro: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
  },
};

export const SemFinanceiro: Story = {
  args: {
    inscricoes: [
      { id: '1', created: '2024-01-01', nome: 'João', telefone: '11999999999' },
    ],
    pedidos: [
      {
        id: '1',
        created: '2024-01-01',
        valor: '100',
        status: 'pago',
        expand: { campo: { id: '1', nome: 'Campo 1' } },
      } as unknown as Pedido,
    ],
    mostrarFinanceiro: false,
  },
};
