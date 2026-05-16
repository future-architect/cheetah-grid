'use strict';

const path = require('node:path');

const rootIgnorePatterns = [
	'**/node_modules/**',
	'**/.*',
	'**/.*/**',
	'**/dist/**',
	'**/dist-ts/**',
	'**/coverage/**',
	'**/report/**',
	'**/test-fixtures/**',
	'**/.vitepress/cache/**',
	'**/old.d.ts',
	'docs/**',
	'patch/**',
	'**/patch/**',
	'**/webpack/fork/**',
	'**/webpack/test/font-svg-to-icons-js-loader/fa_icons.js',
	'**/webpack/test/font-svg-to-icons-js-loader/mdi_icons.js',
	'**/webpack/test/svg-to-icon-js-loader/all_mdi_icons.js'
];

const baseRules = {
	'no-console': 'off',
	'no-extra-parens': 'off',
	'no-irregular-whitespace': [
		'error',
		{'skipRegExps': true}
	],
	'no-prototype-builtins': 'off',
	'no-template-curly-in-string': 'off',
	'class-methods-use-this': 'off',
	'consistent-return': 1,
	'guard-for-in': 'off',
	'no-case-declarations': 'off',
	'no-else-return': 'off',
	'no-empty-function': 'off',
	'no-implicit-coercion': [
		'error',
		{'boolean': false, 'number': true, 'string': false}
	],
	'no-implicit-globals': 'off',
	'no-invalid-this': 'off',
	'no-loop-func': 'off',
	'no-magic-numbers': 'off',
	'no-param-reassign': 'off',
	'no-warning-comments': 'warn',
	'vars-on-top': 'off',
	'wrap-iife': ['error', 'any'],
	'yoda': [
		'error',
		'never',
		{'onlyEquality': true}
	],
	'init-declarations': 'off',
	'no-shadow': 'off',
	'no-undef-init': 'off',
	'no-undefined': 'off',
	'no-unused-vars': [
		'error',
		{'vars': 'all', 'args': 'none', 'caughtErrors': 'none'}
	],
	'no-use-before-define': ['error', {'functions': false, 'classes': false}],
	'callback-return': 'off',
	'global-require': 'off',
	'no-process-env': 'off',
	'brace-style': [
		'error',
		'1tbs',
		{'allowSingleLine': true}
	],
	'capitalized-comments': 'off',
	'comma-dangle': 'off',
	'comma-spacing': [
		'error',
		{'before': false, 'after': true}
	],
	'consistent-this': [
		'error',
		'self'
	],
	'eol-last': 'off',
	'func-names': 'off',
	'func-style': 'off',
	'id-length': 'off',
	'indent': [
		'error',
		'tab',
		{
			'FunctionDeclaration': {'parameters': 2},
			'FunctionExpression': {'parameters': 2},
			'CallExpression': {'arguments': 2},
			'flatTernaryExpressions': true
		}
	],
	'key-spacing': [
		'error',
		{'afterColon': true}
	],
	'line-comment-position': 'off',
	'linebreak-style': 'off',
	'lines-around-comment': 'off',
	'max-len': [
		'error',
		{'code': 120, 'tabWidth': 4, 'ignoreComments': true, 'ignoreTrailingComments': true, 'ignoreStrings': true, 'ignoreRegExpLiterals': true, 'ignoreTemplateLiterals': true}
	],
	'max-lines': 'off',
	'max-params': 'off',
	'max-statements-per-line': 'off',
	'max-statements': [
		'error',
		200
	],
	'multiline-ternary': 'off',
	'newline-per-chained-call': 'off',
	'no-continue': 'off',
	'no-inline-comments': 'off',
	'no-lonely-if': 'off',
	'no-mixed-operators': 'off',
	'no-negated-condition': 'off',
	'no-nested-ternary': 'off',
	'no-plusplus': 'off',
	'no-restricted-syntax': [
		'error',
		'WithStatement'
	],
	'no-tabs': 'off',
	'no-ternary': 'off',
	'no-trailing-spaces': 'error',
	'no-underscore-dangle': 'off',
	'object-curly-newline': 'off',
	'object-property-newline': [
		'error',
		{'allowMultiplePropertiesPerLine': true}
	],
	'one-var': 'off',
	'padded-blocks': 'off',
	'quote-props': ['error', 'consistent'],
	'sort-keys': 'off',
	'sort-vars': 'off',
	'space-before-function-paren': [
		'error',
		'never'
	],
	'spaced-comment': 'off',
	'wrap-regex': 'off',
	'multiline-comment-style': [
		'error',
		'separate-lines'
	],
	'strict': [
		'error',
		'global'
	],
	'lines-between-class-members': [
		'error',
		'never'
	],
	'prefer-destructuring': [
		'error',
		{
			'array': false,
			'object': true
		},
		{
			'enforceForRenamedProperties': false
		}
	],
	'no-multi-assign': 'off',
	'quotes': [
		'error',
		'single'
	],
	'array-element-newline': 'off',
	'function-paren-newline': 'off',
	'array-bracket-newline': 'off',
	'no-eq-null': 'off',
	'eqeqeq': ['error', 'always', {'null': 'ignore'}],
	'max-lines-per-function': 'off',
	'max-classes-per-file': 'off',
	'function-call-argument-newline': 'off',
	'no-confusing-arrow': 'off',
	'require-unicode-regexp': 'off',
	'prefer-object-spread': 'off',
	'prefer-named-capture-group': 'off',
	'sort-imports': 'off',
	'logical-assignment-operators': 'off',
	'no-useless-assignment': 'off',
	'prefer-object-has-own': 'off'
};

function createRootIgnores() {
	return {
		name: 'cheetah-grid/ignores',
		ignores: rootIgnorePatterns
	};
}

function createLinterOptions() {
	return {
		name: 'cheetah-grid/linter-options',
		linterOptions: {
			reportUnusedDisableDirectives: 'off'
		}
	};
}

function createBaseConfig({
	requireFrom = require,
	files = ['**/*.{js,cjs,mjs}'],
	sourceType = 'script',
	includeHtml = false
} = {}) {
	const js = requireFrom('@eslint/js');
	const globals = requireFrom('globals');
	const configs = [
		createRootIgnores(),
		createLinterOptions(),
		{
			name: 'cheetah-grid/base',
			files,
			languageOptions: {
				ecmaVersion: 2020,
				sourceType,
				globals: {
					...globals.browser,
					...globals.node,
					...globals.jasmine
				}
			},
			rules: {
				...js.configs.all.rules,
				...baseRules
			}
		},
		{
			name: 'cheetah-grid/modules',
			files: ['**/*.mjs'],
			languageOptions: {
				sourceType: 'module'
			}
		}
	];

	if (includeHtml) {
		const html = requireFrom('eslint-plugin-html');
		configs.push({
			name: 'cheetah-grid/html',
			files: ['**/*.html'],
			plugins: {html}
		});
	}

	return configs;
}

function createTypeScriptConfig({
	requireFrom = require,
	tsconfigRootDir,
	files = ['**/*.ts', '**/*.tsx'],
	rules = {}
}) {
	const tsParser = requireFrom('@typescript-eslint/parser');
	const tsPlugin = requireFrom('@typescript-eslint/eslint-plugin');
	const prettier = requireFrom('eslint-plugin-prettier');
	const prettierConfig = requireFrom('eslint-config-prettier');
	const eslintRecommendedRules = tsPlugin.configs['eslint-recommended'].overrides[0].rules;
	const recommendedRules = tsPlugin.configs.recommended.rules;

	return [
		{
			name: 'cheetah-grid/typescript',
			files,
			languageOptions: {
				parser: tsParser,
				parserOptions: {
					loggerFn: false,
					project: path.join(tsconfigRootDir, 'tsconfig.json'),
					tsconfigRootDir
				},
				sourceType: 'module'
			},
			plugins: {
				'@typescript-eslint': tsPlugin,
				prettier
			},
			rules: {
				...eslintRecommendedRules,
				...recommendedRules,
				...prettierConfig.rules,
				'no-use-before-define': 'off',
				'@typescript-eslint/no-use-before-define': [
					'error',
					{'functions': false, 'classes': false, 'variables': false}
				],
				'prettier/prettier': 'error',
				'no-useless-constructor': 'off',
				'@typescript-eslint/no-unused-vars': [
					'error',
					{'vars': 'all', 'args': 'none', 'caughtErrors': 'none'}
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
				'@typescript-eslint/restrict-plus-operands': 'error',
				'@typescript-eslint/restrict-template-expressions': ['error', {'allowNumber': true, 'allowAny': true, 'allowBoolean': true}],
				'@typescript-eslint/explicit-module-boundary-types': ['error', {'allowArgumentsExplicitlyTypedAsAny': true}],
				'@typescript-eslint/consistent-type-imports': 'error',
				'@typescript-eslint/no-empty-object-type': 'off',
				'@typescript-eslint/no-unsafe-function-type': 'off',
				'no-duplicate-imports': 'off',
				...rules
			}
		}
	];
}

function createNodeScriptConfig({
	requireFrom = require,
	files = ['lib/**/*.js', 'tests/**/*.js']
} = {}) {
	const nModule = requireFrom('eslint-plugin-n');
	const n = nModule.default || nModule;
	const recommendedScript = n.configs['flat/recommended-script'];

	return [
		{
			name: 'cheetah-grid/node-scripts',
			files,
			...recommendedScript,
			rules: {
				...recommendedScript.rules,
				'n/exports-style': ['error', 'module.exports'],
				'n/prefer-global/buffer': ['error', 'always'],
				'n/prefer-global/console': ['error', 'always'],
				'n/prefer-global/process': ['error', 'always'],
				'n/prefer-global/url-search-params': ['error', 'always'],
				'n/prefer-global/url': ['error', 'always'],
				'no-console': 'off'
			}
		}
	];
}

module.exports = {
	createBaseConfig,
	createNodeScriptConfig,
	createTypeScriptConfig
};
