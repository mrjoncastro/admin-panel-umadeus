import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect } from 'storybook/test';
import NotificationBell from '../app/admin/components/NotificationBell';
import { AuthProvider } from '../lib/context/AuthContext';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/NotificationBell',
  component: NotificationBell,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /notifica/i })).toBeInTheDocument();
  },
};
