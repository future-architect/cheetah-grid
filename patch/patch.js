/* global cp */
'use strict';
require('shelljs/global');
const chalk = require('chalk');
const fs = require('fs');

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
	cp(`./patch/eslint-plugin-vue/rules/${patch}.js`, './node_modules/eslint-plugin-vue/lib/rules/');
});

try {
	const eslintPluginVueIndexFilePath = require.resolve('eslint-plugin-vue/lib/index.js');
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

}

const monorepoPatches = [
	'monorepo/src/lib/spawn.js',
];

monorepoPatches.forEach((patch) => {
	cp(`./patch/${patch}`, './node_modules/monorepo/src/lib/');
});

console.log(chalk.green('Patch complete.\n'));
