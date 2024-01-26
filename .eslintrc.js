/* eslint-env node */
module.exports = {
  extends: [
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
    project: 'tsconfig.json',
  },
  ignorePatterns: ['.eslintrc.js', 'tsconfig.json'],
};
