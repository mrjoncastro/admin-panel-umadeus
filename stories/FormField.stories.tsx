import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormField } from '../components/molecules/FormField';
import { TextField } from '../components/atoms/TextField';
import { TenantProvider } from '../lib/context/TenantContext';

const meta = {
  title: 'Design System/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: { label: 'Nome', htmlFor: 'nome' },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <TextField id="nome" />
    </FormField>
  ),
};

export const TemaDinamico: Story = {
  render: (args) => (
    <div className="space-y-4">
      <TenantProvider initialConfig={{ primaryColor: '#2563eb', font: 'var(--font-geist)', logoUrl: '/img/logo_umadeus_branco.png', confirmaInscricoes: false }}>
        <FormField {...args}>
          <TextField id="nome1" />
        </FormField>
      </TenantProvider>
      <TenantProvider initialConfig={{ primaryColor: '#dc2626', font: 'var(--font-geist)', logoUrl: '/img/logo_umadeus_branco.png', confirmaInscricoes: false }}>
        <FormField {...args}>
          <TextField id="nome2" />
        </FormField>
      </TenantProvider>
    </div>
  ),
};
