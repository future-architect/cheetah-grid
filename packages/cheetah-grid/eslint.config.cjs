'use strict';

const {defineConfig} = require('eslint/config');
const {createBaseConfig, createTypeScriptConfig} = require('../../eslint/eslint-config.cjs');

module.exports = defineConfig([
	...createBaseConfig({
		requireFrom: require,
		files: ['**/*.{js,cjs,mjs,ts}'],
		includeHtml: true
	}),
	...createTypeScriptConfig({
		requireFrom: require,
		tsconfigRootDir: __dirname,
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{'vars': 'all', 'args': 'none', 'varsIgnorePattern': '^_'}
			]
		}
	})
]);
