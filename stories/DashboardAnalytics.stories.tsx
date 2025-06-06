import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect } from 'storybook/test';
import DashboardAnalytics from '../app/admin/components/DashboardAnalytics';
import { ThemeProvider } from '../lib/context/ThemeContext';

const meta = {
  title: 'Admin/DashboardAnalytics',
  component: DashboardAnalytics,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    inscricoes: { control: 'object' },
    pedidos: { control: 'object' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    inscricoes: [
      { id: '1', created: '2024-01-01' },
      { id: '2', created: '2024-01-02' },
    ],
    pedidos: [
      { id: '1', created: '2024-01-01', valor: '100', status: 'pago', expand: { campo: { nome: 'Campo 1' } } },
      { id: '2', created: '2024-01-02', valor: '50', status: 'pago', expand: { campo: { nome: 'Campo 1' } } },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
  },
};
