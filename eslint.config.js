// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
// prettier is not used in this config but it's a good idea to include it
// in your project so that you can format your code using Prettier
// if you want to.
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    // This is the main configuration for your project.
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'warn',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'warn',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/component-class-suffix': [
        'warn',
        {
          suffixes: ['Component'],
        },
      ],
      '@angular-eslint/directive-class-suffix': [
        'warn',
        {
          suffixes: ['Directive'],
        },
      ],
      '@angular-eslint/no-conflicting-lifecycle': 'warn',
      '@angular-eslint/no-host-metadata-property': 'warn',
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/no-inputs-metadata-property': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      '@angular-eslint/no-output-on-prefix': 'warn',
      // no explicit any
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
