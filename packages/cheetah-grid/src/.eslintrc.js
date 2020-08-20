'use strict';

module.exports = {
	overrides: [
		{
			'files': ['*.ts', '*.tsx'],
			'parser': '@typescript-eslint/parser',
			'parserOptions': {
				loggerFn: false,
				project: 'tsconfig.json',
			},
			'plugins': ['@typescript-eslint', 'prettier'],
			'extends': [
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier',
				'prettier/@typescript-eslint'
			],
			'rules': {
				'no-use-before-define': 'off',
				'@typescript-eslint/no-use-before-define': ['error', {'functions': false, 'classes': false}],
				'prettier/prettier': 'error',
				'no-useless-constructor': 'off',
				'@typescript-eslint/no-unused-vars': [
					'error',
					{'vars': 'all', 'args': 'none', 'varsIgnorePattern': '^_'}
				],
				'no-unused-expressions': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/ban-ts-comment': 'error',
				'@typescript-eslint/no-extra-non-null-assertion': 'error',
				'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
				'@typescript-eslint/prefer-as-const': 'error',
				'@typescript-eslint/no-for-in-array': 'error',
				'@typescript-eslint/no-misused-promises': ['error', {'checksVoidReturn': false, 'checksConditionals': false}],
				'@typescript-eslint/no-unnecessary-type-assertion': 'error',
				'@typescript-eslint/prefer-regexp-exec': 'error',
				// "@typescript-eslint/unbound-method": "error",
				// "@typescript-eslint/no-unsafe-assignment": "error",
				// "@typescript-eslint/no-unsafe-call":"error",
				// "@typescript-eslint/no-unsafe-member-access": "error",
				// "@typescript-eslint/no-unsafe-return": "error",
				// "@typescript-eslint/prefer-nullish-coalescing": "error",
				// "@typescript-eslint/prefer-optional-chain": "error",
				'@typescript-eslint/restrict-plus-operands': 'error',
				'@typescript-eslint/restrict-template-expressions': ['error', {allowNumber: true, allowAny: true, allowBoolean: true}],
				'@typescript-eslint/explicit-module-boundary-types': ['error', {allowArgumentsExplicitlyTypedAsAny: true}],

				'@typescript-eslint/consistent-type-imports': 'error',
				'no-duplicate-imports': 'off'
			}
		}
	]
};