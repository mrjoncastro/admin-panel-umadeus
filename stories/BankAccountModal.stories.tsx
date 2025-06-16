import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, fn } from 'storybook/test';
import BankAccountModal from '@/app/admin/financeiro/transferencia/components/modals/BankAccountModal';
import { AuthProvider } from '../lib/context/AuthContext';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Design System/BankAccountModal',
  component: BankAccountModal,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  args: {
    open: true,
    onClose: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BankAccountModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Adicionar Conta/i)).toBeInTheDocument();
  },
};
