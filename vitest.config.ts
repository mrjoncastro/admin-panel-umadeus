/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()] as any,
  resolve: {
    alias: {
      // de '@/foo' para '<root>/foo'
      '@': path.resolve(__dirname),
    },
  },
  test: {
    include: ['__tests__/**/*.{test.ts,test.tsx,a11y.test.tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
})
