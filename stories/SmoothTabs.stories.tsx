import type { Meta, StoryObj } from '@storybook/nextjs';
import SmoothTabs from '../components/SmoothTabs';

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

export const Default: Story = {};
