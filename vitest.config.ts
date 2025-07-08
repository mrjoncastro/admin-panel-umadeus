// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // mapear '@/...' para a pasta gateway
      '@': path.resolve(__dirname, 'services/gateway'),
    },
  },
  test: {
    include: ['__tests__/**/*.{test.ts,test.tsx,a11y.test.tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
})
