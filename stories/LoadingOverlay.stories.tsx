import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';

const meta = {
  title: 'Design System/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { show: true, text: 'Carregando...' },
  render: (args) => {
    const [show, setShow] = useState(args.show);
    return (
      <div>
        <button onClick={() => setShow(!show)} className="btn btn-primary mb-4">
          Toggle
        </button>
        <LoadingOverlay {...args} show={show} />
      </div>
    );
  },
};
