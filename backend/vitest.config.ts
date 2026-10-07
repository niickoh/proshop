import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // mongodb-memory-server descarga el binario de Mongo la primera vez
    hookTimeout: 120_000,
  },
});
