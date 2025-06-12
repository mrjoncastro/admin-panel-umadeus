import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import ModalAnimated from '../components/ModalAnimated';

const meta = {
  title: 'Design System/ModalAnimated',
  component: ModalAnimated,
  tags: ['autodocs'],
} satisfies Meta<typeof ModalAnimated>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: true, children: 'Exemplo' },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          Abrir modal
        </button>
        <ModalAnimated {...args} open={open} onOpenChange={setOpen}>
          <div className="text-center space-y-4">
            <p>Conteúdo do modal</p>
            <button onClick={() => setOpen(false)} className="btn btn-secondary">
              Fechar
            </button>
          </div>
        </ModalAnimated>
      </div>
    );
  },
};
