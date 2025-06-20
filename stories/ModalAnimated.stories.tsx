import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { within, userEvent, expect } from 'storybook/test';
import ModalAnimated from '../components/organisms/ModalAnimated';

const meta = {
  title: 'Design System/ModalAnimated',
  component: ModalAnimated,
  tags: ['autodocs'],
} satisfies Meta<typeof ModalAnimated>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: false, children: 'Exemplo' },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          Abrir modal
        </button>
        <ModalAnimated {...args} open={open} onOpenChange={setOpen}>
          <div className="text-center space-y-4">
          <Dialog.Title asChild>
            <h3 className="font-semibold">Exemplo</h3>
          </Dialog.Title>
          <Dialog.Description className="sr-only">Descrição do modal de exemplo</Dialog.Description>
          <p>Conteúdo do modal</p>
            <button onClick={() => setOpen(false)} className="btn btn-secondary">
              Fechar
            </button>
          </div>
        </ModalAnimated>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /abrir modal/i });
    await userEvent.click(openButton);
    await expect(canvas.getByText(/Conteúdo do modal/i)).toBeInTheDocument();
    const closeButton = canvas.getByRole('button', { name: /fechar/i });
    await userEvent.click(closeButton);
    await expect(canvas.queryByText(/Conteúdo do modal/i)).not.toBeInTheDocument();
  },
};
