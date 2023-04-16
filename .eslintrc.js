module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "comma-dangle": ["error", "only-multiline"],
    "@typescript-eslint/indent": ["error", 2],
    "no-tabs": ["error", {}],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "space-before-function-paren": ["error", "never"],
  }
};
