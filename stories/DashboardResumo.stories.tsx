import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import DashboardResumo from '../app/admin/dashboard/components/DashboardResumo';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/DashboardResumo',
  component: DashboardResumo,
  argTypes: {
    inscricoes: { control: 'object' },
    pedidos: { control: 'object' },
    filtroStatus: { control: 'text' },
    setFiltroStatus: { action: 'change' },
  },
  args: {
    inscricoes: [
      {
        id: '1',
        status: 'confirmado',
        expand: { campo: { nome: 'Campo 1' }, pedido: { status: 'pago', valor: 50 } },
      },
      {
        id: '2',
        status: 'pendente',
        expand: { campo: { nome: 'Campo 2' }, pedido: { status: 'pendente', valor: 30 } },
      },
    ],
    pedidos: [
      { id: 'p1', status: 'pago', valor: '50', expand: { campo: { nome: 'Campo 1' } } },
      { id: 'p2', status: 'pendente', valor: '30', expand: { campo: { nome: 'Campo 2' } } },
    ],
    filtroStatus: 'pago',
    setFiltroStatus: fn(),
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardResumo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Total de Inscrições/i)).toBeInTheDocument();
  },
};
