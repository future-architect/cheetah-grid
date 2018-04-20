/* global cp */
'use strict';
require('shelljs/global');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const opts = {cwd: process.cwd()};

function resolve(dir) {
	return path.resolve(opts.cwd, dir);
}

const eslintPluginVuePatches = [
	// https://github.com/vuejs/eslint-plugin-vue/pull/397
	'component-name-in-template-casing',
	// https://github.com/vuejs/eslint-plugin-vue/pull/406
	'no-use-v-if-with-v-for',

	// https://github.com/ota-meshi/eslint-plugin-vue/blob/develop/add-component-tags-order/lib/rules/component-tags-order.js
	'component-tags-order',

	// https://github.com/vuejs/eslint-plugin-vue/pull/445
	'html-content-newline'
];

eslintPluginVuePatches.forEach((patch) => {
	cp(path.resolve(__dirname, `./eslint-plugin-vue/rules/${patch}.js`), resolve('./node_modules/eslint-plugin-vue/lib/rules/'));
});

try {
	const eslintPluginVueIndexFilePath = resolve('./node_modules/eslint-plugin-vue/lib/index.js');
	const eslintPluginVueIndex = fs.readFileSync(eslintPluginVueIndexFilePath, 'utf8');
	fs.writeFileSync(
			eslintPluginVueIndexFilePath,
			eslintPluginVueIndex.replace(
					/rules: {\r?\n/,
					() => {
						const addRuleList = [
							'component-name-in-template-casing',
							'component-tags-order',
							'no-use-v-if-with-v-for',
							'html-content-newline'
						].filter((rule) => !eslintPluginVueIndex.includes(rule)).
							map((rule) => `    '${rule}': require('./rules/${rule}'),\n`);
						return `rules: {\n${addRuleList.join('')}`;
					}
			)
	);
} catch (e) {
	// console.log(e)
}

console.log(chalk.green('Patch complete.\n'));
