import type { Meta, StoryObj } from '@storybook/nextjs';
import SmoothTabs from '../components/SmoothTabs';
import { within, userEvent, expect } from 'storybook/test';

const tabs = [
  { value: 'tab1', label: 'Tab 1', content: <p>Conteúdo 1</p> },
  { value: 'tab2', label: 'Tab 2', content: <p>Conteúdo 2</p> },
  { value: 'tab3', label: 'Tab 3', content: <p>Conteúdo 3</p> },
];

const meta = {
  title: 'Design System/SmoothTabs',
  component: SmoothTabs,
  tags: ['autodocs'],
  args: { tabs },
} satisfies Meta<typeof SmoothTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: 'tab1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab2 = canvas.getByRole('tab', { name: /tab 2/i });
    await userEvent.click(tab2);
    await expect(canvas.getByText('Conteúdo 2')).toBeInTheDocument();
    const tab3 = canvas.getByRole('tab', { name: /tab 3/i });
    await userEvent.click(tab3);
    await expect(canvas.getByText('Conteúdo 3')).toBeInTheDocument();
  },
};
