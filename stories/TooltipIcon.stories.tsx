import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, expect, userEvent } from 'storybook/test';
import TooltipIcon from '../app/admin/components/TooltipIcon';

const meta = {
  title: 'Admin/TooltipIcon',
  component: TooltipIcon,
  argTypes: {
    label: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TooltipIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Texto do tooltip',
  },
  render: (args) => (
    <TooltipIcon {...args}>
      <button>?</button>
    </TooltipIcon>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await userEvent.hover(button);
    await expect(canvas.getByText(args.label)).toBeInTheDocument();
  },
};
