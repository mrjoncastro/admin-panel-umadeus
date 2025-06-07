import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.dirname(fileURLToPath(import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.ts'],
  },
})
