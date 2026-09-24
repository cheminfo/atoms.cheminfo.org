import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // e2e/*.spec.ts belongs to playwright, which vitest cannot run.
    exclude: [...defaultExclude, 'e2e/**'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      // The Lewis tests load OpenChemLib; v8 would profile all of it, istanbul
      // instruments only src.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
