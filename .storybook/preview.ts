import '../app/globals.css';
import { AppConfigProvider } from '../lib/context/AppConfigContext';

import type { Preview } from '@storybook/nextjs'

const preview: Preview = {
  decorators: [
    (Story) => (
      <AppConfigProvider>
        <Story />
      </AppConfigProvider>
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
};

export default preview;
