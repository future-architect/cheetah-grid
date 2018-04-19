// http://eslint.org/docs/user-guide/configuring
'use strict';

module.exports = {
	'root': true,
	'parserOptions': {
		parser: 'babel-eslint',
		ecmaVersion: 2017,
		sourceType: 'module'
	},
	'env': {
		browser: true,
		mocha: true
	},

	'extends': [
		// https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
		'standard',
		// https://github.com/vuejs/eslint-plugin-vue#gear-configs
		'plugin:vue/recommended'
	],
	'plugins': [
		'vue'
	],
	// add your custom rules here
	'rules': {
		'no-var': 'error',
		'prefer-const': 'error',
		'prefer-arrow-callback': 'error',
		'prefer-template': 'error',
		'object-shorthand': 'error',
		'no-new': 'off',
		'prefer-destructuring': 'error',
		// allow paren-less arrow functions
		'arrow-parens': 'off',
		// allow async-await
		'generator-star-spacing': 'off',
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

		// Uncategorized Rules
		'vue/prop-name-casing': 'error',
		'vue/html-closing-bracket-spacing': 'error'
	},
	'globals': {
	}
};
