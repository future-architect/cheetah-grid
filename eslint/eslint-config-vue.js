// http://eslint.org/docs/user-guide/configuring
'use strict';

module.exports = {
	'root': true,
	'parserOptions': {
		ecmaVersion: 2020,
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
		'plugin:vue/recommended',
		'plugin:vue/vue3-recommended',
		// https://www.npmjs.com/package/eslint-config-vue-preset
		'vue-preset/vue/recommended-e',
		'vue-preset/standard'
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
		'vue/component-name-in-template-casing': ['error', 'kebab-case'],

		'vue/multiline-html-element-content-newline': 'error',
		'vue/no-spaces-around-equal-signs-in-attribute': 'error',
	},
	'globals': {
	}
};
