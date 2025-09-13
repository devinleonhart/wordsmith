import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/@types/',
        '**/*.d.ts',
        'vitest.config.ts',
        // Exclude infrastructure files that are hard to test in isolation
        'src/index.ts',
        'src/commands/**',
        'src/events/**',
        'src/functions/**',
        'eslint.config.js'
      ],
      thresholds: {
        global: {
          branches: 85,  // Currently at 85%
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  }
})
