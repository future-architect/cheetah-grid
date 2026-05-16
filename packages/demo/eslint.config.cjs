'use strict';

const {defineConfig} = require('eslint/config');
const {createVueConfig} = require('../../eslint/eslint-config-vue.cjs');

module.exports = defineConfig([
	...createVueConfig({
		requireFrom: require
	})
]);
