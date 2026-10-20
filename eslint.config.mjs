import { defineConfig } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  tseslint.configs.recommendedTypeChecked,

  // Formatting, enforced by `eslint --fix` (no separate formatter). Options
  // match the existing style: no semicolons, single quotes, no trailing commas.
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    commaDangle: 'never',
    braceStyle: '1tbs'
  }),

  {
    languageOptions: {
      parserOptions: {
        // eslint.config.mjs isn't in any tsconfig; lint it with a default project.
        projectService: { allowDefaultProject: ['eslint.config.mjs'] },
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Catch the async-bug class that bites Discord bots.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // House style differs from Stylistic's defaults here.
      '@stylistic/space-before-function-paren': ['error', 'always'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      // "It's" reads better than 'It\'s'.
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/operator-linebreak': ['error', 'after'],
      // One-line helpers and `() => { shutdown('SIGINT') }` handlers are fine.
      '@stylistic/max-statements-per-line': 'off'
    }
  },

  {
    // Tests drive commands with loosely typed `any` mocks and async stubs on
    // purpose, so the any-propagation and await checks are noise there.
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
)
