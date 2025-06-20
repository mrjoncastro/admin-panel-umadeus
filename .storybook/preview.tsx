import '../app/globals.css'
import { TenantProvider } from '../lib/context/TenantContext'

import type { Preview } from '@storybook/nextjs'

const preview: Preview = {
  decorators: [
    (Story) => (
      <TenantProvider>
        <Story />
      </TenantProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
