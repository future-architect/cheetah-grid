'use strict';

const base = require('../../eslint/eslint-config.js');

module.exports = {
	...base,
	overrides: [
		...base.overrides || [],
		{
			files: ['*.ts', '**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				loggerFn: false,
				project: 'tsconfig.json',
			},
			plugins: ['@typescript-eslint', 'prettier'],
			extends: [
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier',
				'prettier/@typescript-eslint'
			],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': ['error', {allowArgumentsExplicitlyTypedAsAny: true}],
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-use-before-define': ['error', {functions: false, classes: false}],
				'@typescript-eslint/restrict-plus-operands': 'off',
				'@typescript-eslint/restrict-template-expressions': ['error', {allowNumber: true, allowAny: true}],
				'@typescript-eslint/no-unused-vars': ['error', {vars: 'all', args: 'none'}],
				'@typescript-eslint/consistent-type-imports': 'error',
				'no-duplicate-imports': 'off',
				'no-use-before-define': 'off',
				'prettier/prettier': 'error'
			}
		}
	]
};
