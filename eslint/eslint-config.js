'use strict';

module.exports = {
	'root': true,
	'parserOptions': {
		'ecmaVersion': 2020,
		'sourceType': 'script',
	},
	'env': {
		'node': true,
		'browser': true,
		'jasmine': true,
		'es6': true
	},
	'extends': [
		'eslint:all',
	],
	'plugins': ['html'],
	'rules': {
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
			{'vars': 'all', 'args': 'none'}
		],
		'no-use-before-define': ['error', {'functions': false, 'classes': false}],
		'callback-return': 'off',
		'global-require': 'off', //TODO
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
		// TODO 'padded-blocks': ['error', 'never'],
		'padded-blocks': 'off',
		'quote-props': ['error', 'consistent'],
		'require-jsdoc': 'off',
		'sort-keys': 'off',
		'sort-vars': 'off',
		'space-before-function-paren': [
			'error',
			'never'
		],
		'spaced-comment': 'off', // TODO
		'wrap-regex': 'off',
		//
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
		// v5
		'max-lines-per-function': 'off',
		'max-classes-per-file': 'off',
		// v6
		'function-call-argument-newline': 'off',

		// ECMAScript 6+
		'no-confusing-arrow': 'off',
		// 'prefer-template': 'off',
		'require-unicode-regexp': 'off',
		'prefer-object-spread': 'off',
		'prefer-named-capture-group': 'off',

	}

};