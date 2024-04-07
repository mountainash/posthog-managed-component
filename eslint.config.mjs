import globals from 'globals'
import js from '@eslint/js'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.es2020,
      },
      parserOptions: {
        globalReturn: true,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-undef': 'off',
      'no-useless-escape': 'off',
    },
  },
  {
    files: ['*d.ts'],
    rules: {
      'no-undef': 'off',
    },
  },
  // ref: https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
  eslintPluginPrettierRecommended,
]
