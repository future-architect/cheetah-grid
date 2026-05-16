'use strict';

const {defineConfig} = require('eslint/config');
const {createBaseConfig, createTypeScriptConfig} = require('../../eslint/eslint-config.cjs');

module.exports = defineConfig([
	...createBaseConfig({
		requireFrom: require,
		files: ['**/*.{js,cjs,mjs,ts}']
	}),
	...createTypeScriptConfig({
		requireFrom: require,
		tsconfigRootDir: __dirname,
		rules: {
			'@typescript-eslint/restrict-plus-operands': 'off',
			'@typescript-eslint/restrict-template-expressions': ['error', {'allowNumber': true, 'allowAny': true}]
		}
	})
]);
