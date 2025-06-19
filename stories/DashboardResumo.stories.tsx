import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import DashboardResumo from '../app/admin/dashboard/components/DashboardResumo';
import { ThemeProvider } from '../lib/context/ThemeContext';
import { Pedido } from '@/types';

const meta = {
  title: 'Admin/DashboardResumo',
  component: DashboardResumo,
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
    filtroStatus: { control: 'text' },
    setFiltroStatus: { action: 'setFiltroStatus' },
  },
  args: {
    inscricoes: [
      { id: '1', nome: 'João', telefone: '11999999999', status: 'confirmado', expand: { pedido: { id: '1', valor: '100', status: 'pago' } } },
      { id: '2', nome: 'Maria', telefone: '11988888888', status: 'pendente', expand: { pedido: { id: '2', valor: '50', status: 'pendente' } } },
    ],
    pedidos: [
      {
        id: '1',
        status: 'pago',
        valor: '100',
        expand: { campo: { id: '1', nome: 'Campo 1' } },
        canal: 'inscricao',
        // Adicione outros campos obrigatórios do tipo Pedido aqui se necessário
      } as unknown as Pedido,
      {
        id: '2',
        status: 'pendente',
        valor: '50',
        expand: { campo: { id: '2', nome: 'Campo 2' } },
        canal: 'inscricao',
        // Adicione outros campos obrigatórios do tipo Pedido aqui se necessário
      } as unknown as Pedido,
    ],
    filtroStatus: 'pago',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardResumo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    inscricoes: [
      { id: '1', nome: 'João', telefone: '11999999999', status: 'confirmado', expand: { pedido: { id: '1', valor: '100', status: 'pago' } } },
      { id: '2', nome: 'Maria', telefone: '11988888888', status: 'pendente', expand: { pedido: { id: '2', valor: '50', status: 'pendente' } } },
    ],
    pedidos: [
      {
        id: '1',
        status: 'pago',
        valor: '100',
        expand: { campo: { id: '1', nome: 'Campo 1' } },
        canal: 'inscricao',
      } as unknown as Pedido,
      {
        id: '2',
        status: 'pendente',
        valor: '50',
        expand: { campo: { id: '2', nome: 'Campo 2' } },
        canal: 'inscricao',
      } as unknown as Pedido,
    ],
    filtroStatus: 'pago',
    setFiltroStatus: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Total de Inscrições/i)).toBeInTheDocument();
  },
};
