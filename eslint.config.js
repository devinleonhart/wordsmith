const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        // eslint.config.js isn't in any tsconfig; lint it with a default project.
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Catch the async-bug class that bites Discord bots.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
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
  },

  {
    // This file is CommonJS by necessity.
    files: ['eslint.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' }
  }
);
