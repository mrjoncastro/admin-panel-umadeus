import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, userEvent, expect } from 'storybook/test';
import TransferenciaForm from '../components/TransferenciaForm';

const meta = {
  title: 'Design System/TransferenciaForm',
  component: TransferenciaForm,
  tags: ['autodocs'],
  argTypes: {
    onTransfer: { action: 'onTransfer' },
  },
} satisfies Meta<typeof TransferenciaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sucesso: Story = {
  args: {
    onTransfer: async () => {},
  },
};

export const ErroTransferencia: Story = {
  args: {
    onTransfer: async () => {
      throw new Error('fail');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText(/destinat\u00e1rio/i), 'user');
    await userEvent.type(canvas.getByPlaceholderText(/valor/i), '10');
    await userEvent.click(canvas.getByRole('button', { name: /transferir/i }));
    await expect(canvas.getByText(/erro ao transferir/i)).toBeInTheDocument();
  },
};
