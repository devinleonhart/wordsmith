module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module"
  },
  rules: {
    "comma-dangle": ["error", "only-multiline"],
    semi: ["error", "always"],
    "space-before-function-paren": ["error", "never"],
  }
};
