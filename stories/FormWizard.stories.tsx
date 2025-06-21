import type { Meta, StoryObj } from '@storybook/react'
import { TenantProvider } from '../lib/context/TenantContext'
import FormWizard from '../components/organisms/FormWizard'
import React from 'react'

const meta = {
  title: 'Design System/FormWizard',
  component: FormWizard,
  decorators: [
    (Story) => (
      <TenantProvider>
        <Story />
      </TenantProvider>
    ),
  ],
} satisfies Meta<typeof FormWizard>

export default meta

type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <FormWizard
      steps={[
        { title: 'Passo 1', content: <div>Conteúdo 1</div> },
        { title: 'Passo 2', content: <div>Conteúdo 2</div> },
      ]}
    />
  ),
}
