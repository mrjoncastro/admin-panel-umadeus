import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import RedefinirSenhaModal from '../app/admin/components/RedefinirSenhaModal';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/RedefinirSenhaModal',
  component: RedefinirSenhaModal,
  argTypes: {
    onClose: { action: 'close' },
  },
  args: {
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
} satisfies Meta<typeof RedefinirSenhaModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Redefinir senha/i)).toBeInTheDocument();
  },
};
