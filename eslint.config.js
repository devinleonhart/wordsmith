const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        // eslint.config.js isn't in any tsconfig; lint it with a default project.
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Catch the async-bug class that bites Discord bots.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  }
);
