import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import { fn } from 'storybook/test';
import PostContentEditor from '../app/admin/posts/components/PostContentEditor';

const meta = {
  title: 'Admin/PostContentEditor',
  component: PostContentEditor,
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
  },
  args: {
    value: '# Post de Exemplo\n\nEdite o conte\u00fado...',
    onChange: fn(),
  },
} satisfies Meta<typeof PostContentEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [content, setContent] = useState(value);
  return (
    <PostContentEditor
      value={content}
      onChange={(val) => {
        setContent(val);
        onChange(val);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...(args as unknown)} />,
};
