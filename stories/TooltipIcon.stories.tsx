import { TenantProvider } from '../lib/context/TenantContext'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { within, expect, userEvent } from 'storybook/test'
import TooltipIcon from '../app/admin/components/TooltipIcon'

const meta = {
  title: 'Admin/TooltipIcon',
  component: TooltipIcon,
  argTypes: {
    label: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TooltipIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Texto do tooltip',
    children: <button>?</button>,
  },
  render: (args) => <TooltipIcon {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
    await userEvent.hover(button)
    await expect(canvas.getByText(args.label)).toBeInTheDocument()
  },
}

export const TemaDinamico: Story = {
  render: (args) => (
    <div className=\"space-y-4\">
      <TenantProvider
        initialConfig={{
          primaryColor: '#2563eb',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <TooltipIcon {...args} />
      </TenantProvider>
      <TenantProvider
        initialConfig={{
          primaryColor: '#dc2626',
          font: 'var(--font-geist)',
          logoUrl: '/img/logo_umadeus_branco.png',
          confirmaInscricoes: false,
        }}
      >
        <TooltipIcon {...args} />
      </TenantProvider>
    </div>
  ),
}
