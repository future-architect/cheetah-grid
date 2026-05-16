'use strict';

const {defineConfig} = require('eslint/config');
const {createBaseConfig, createNodeScriptConfig} = require('../../eslint/eslint-config.cjs');

module.exports = defineConfig([
	...createBaseConfig({
		requireFrom: require
	}),
	...createNodeScriptConfig({
		requireFrom: require
	})
]);
