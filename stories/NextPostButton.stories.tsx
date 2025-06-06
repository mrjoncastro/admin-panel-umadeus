import type { Meta, StoryObj } from '@storybook/nextjs';
import NextPostButton from '../app/blog/components/NextPostButton';

const meta = {
  title: 'Blog/NextPostButton',
  component: NextPostButton,
  argTypes: {
    slug: { control: 'text' },
  },
  args: {
    slug: 'proximo-post',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NextPostButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
