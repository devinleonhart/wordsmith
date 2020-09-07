module.exports = {
  root: true,
  env: {
    commonjs: true,
    mocha: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 11,
    parser: "@typescript-eslint/parser",
  },
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:mocha/recommended"
  ],
  rules: {
    "comma-dangle": ["error", "only-multiline"],
    "import/no-extraneous-dependencies": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "max-len": "off",
    "no-empty-pattern": "off",
    "no-new": "off",
    "no-param-reassign": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "semi": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
    "quotes": ["error", "double"],
    "mocha/no-hooks-for-single-case": "off",
  }
};
