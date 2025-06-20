import type { Meta, StoryObj } from '@storybook/nextjs';
import SaldoCard from '../components/molecules/SaldoCard';

const meta = {
  title: 'Design System/SaldoCard',
  component: SaldoCard,
  tags: ['autodocs'],
  args: { saldo: 1200.5 },
} satisfies Meta<typeof SaldoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComSaldo: Story = {};

export const SemSaldo: Story = {
  args: { saldo: 0 },
};
