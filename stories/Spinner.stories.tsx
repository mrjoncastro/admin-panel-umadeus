import type { Meta, StoryObj } from '@storybook/nextjs'
import Spinner from '../components/atoms/Spinner'

const meta = {
  title: 'Design System/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    className: 'w-8 h-8 text-primary-600',
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomSize: Story = {
  args: {
    className: 'w-12 h-12 text-primary-500',
  },
}
