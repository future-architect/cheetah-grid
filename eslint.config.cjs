'use strict';

const {defineConfig} = require('eslint/config');
const {createBaseConfig} = require('./eslint/eslint-config.cjs');

module.exports = defineConfig([
	...createBaseConfig({
		requireFrom: require,
		includeHtml: true
	})
]);
