import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect } from 'storybook/test';
import Header from '../app/admin/components/Header';
import { AuthProvider } from '../lib/context/AuthContext';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/Header',
  component: Header,
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
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).toBeInTheDocument();
  },
};
