import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.spec.js'],
    setupFiles: ['src/__tests__/setup.js']
  }
});