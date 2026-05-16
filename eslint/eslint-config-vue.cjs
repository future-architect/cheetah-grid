'use strict';

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

function createVueConfig({requireFrom = require} = {}) {
	const js = requireFrom('@eslint/js');
	const globals = requireFrom('globals');
	const vue = requireFrom('eslint-plugin-vue');

	return [
		{
			name: 'cheetah-grid/vue-ignores',
			ignores: rootIgnorePatterns
		},
		{
			name: 'cheetah-grid/vue-linter-options',
			linterOptions: {
				reportUnusedDisableDirectives: 'off'
			}
		},
		{
			name: 'cheetah-grid/vue-js',
			files: ['**/*.{js,cjs,mjs,vue}'],
			languageOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				globals: {
					...globals.browser,
					...globals.mocha,
					...globals.node
				}
			},
			rules: js.configs.recommended.rules
		},
		...vue.configs['flat/recommended'],
		{
			name: 'cheetah-grid/vue-custom',
			files: ['**/*.{js,cjs,mjs,vue}'],
			languageOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				globals: {
					...globals.browser,
					...globals.mocha,
					...globals.node
				}
			},
			rules: {
				'no-unused-vars': ['error', {'vars': 'all', 'args': 'none', 'caughtErrors': 'none'}],
				'no-var': 'error',
				'prefer-const': 'error',
				'prefer-arrow-callback': 'error',
				'prefer-template': 'error',
				'object-shorthand': 'error',
				'no-new': 'off',
				'prefer-destructuring': 'error',
				'arrow-parens': 'off',
				'generator-star-spacing': 'off',
				'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
				'vue/component-name-in-template-casing': ['error', 'kebab-case'],
				'vue/multi-word-component-names': 'off',
				'vue/multiline-html-element-content-newline': 'error',
				'vue/no-spaces-around-equal-signs-in-attribute': 'error'
			}
		}
	];
}

module.exports = {
	createVueConfig
};
