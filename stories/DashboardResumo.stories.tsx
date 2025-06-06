import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import DashboardResumo from '../app/admin/dashboard/components/DashboardResumo';
import { ThemeProvider } from '../lib/context/ThemeContext';

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
      { id: '1', status: 'confirmado', expand: { pedido: { valor: '100', status: 'pago' } } },
      { id: '2', status: 'pendente', expand: { pedido: { valor: '50', status: 'pendente' } } },
    ],
    pedidos: [
      { id: '1', status: 'pago', valor: '100', expand: { campo: { nome: 'Campo 1' } } },
      { id: '2', status: 'pendente', valor: '50', expand: { campo: { nome: 'Campo 2' } } },
    ],
    filtroStatus: 'pago',
  },
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
