'use strict';

const {defineConfig} = require('eslint/config');
const {createBaseConfig, createTypeScriptConfig} = require('../../eslint/eslint-config.cjs');

module.exports = defineConfig([
	...createBaseConfig({
		requireFrom: require,
		files: ['**/*.{js,cjs,mjs,ts,mts}']
	}),
	...createTypeScriptConfig({
		requireFrom: require,
		tsconfigRootDir: __dirname,
		files: ['**/*.ts', '**/*.mts']
	})
]);
