import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    silent: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/@types/',
        '**/*.d.ts',
        'vitest.config.mts',
        // Exclude bootstrapping/infrastructure files with no testable logic
        'src/index.ts',
        'src/bootstrap.ts',
        'src/registry.ts',
        'src/register.ts',
        'src/events/ready.ts',
        'eslint.config.js'
      ],
      // Flat keys — vitest ignores a `global:` wrapper (that's a jest/nyc-ism),
      // which had silently disabled enforcement. These are now actually gated.
      thresholds: {
        statements: 95,
        functions: 95,
        lines: 95,
        branches: 85
      }
    }
  }
})
