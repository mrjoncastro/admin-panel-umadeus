// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // de '@/foo' para '<root>/foo'
      '@': path.resolve(__dirname),
    },
  },
  test: {
    include: ['__tests__/**/*.{test.ts,test.tsx}'],
    environment: 'jsdom',
    globals: true,
  },
})
