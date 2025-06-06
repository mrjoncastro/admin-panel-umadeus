import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import ModalVisualizarPedido from '../app/admin/inscricoes/componentes/ModalVisualizarPedido';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/ModalVisualizarPedido',
  component: ModalVisualizarPedido,
  argTypes: {
    onClose: { action: 'close' },
  },
  args: {
    pedidoId: 'abc123',
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ModalVisualizarPedido>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Detalhes do Pedido/i)).toBeInTheDocument();
  },
};
