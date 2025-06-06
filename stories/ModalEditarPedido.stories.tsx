import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import ModalEditarPedido from '../app/admin/pedidos/componentes/ModalEditarPedido';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/ModalEditarPedido',
  component: ModalEditarPedido,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  args: {
    pedido: {
      id: '1',
      produto: 'Camisa',
      email: 'teste@exemplo.com',
      tamanho: 'M',
      cor: 'Azul',
      status: 'pendente',
    },
    onClose: fn(),
    onSave: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModalEditarPedido>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Editar Pedido/i)).toBeInTheDocument();
  },
};
