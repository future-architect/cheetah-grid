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
	// https://github.com/ota-meshi/eslint-plugin-vue/blob/develop/add-component-tags-order/lib/rules/component-tags-order.js
	'component-tags-order'
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
							'component-tags-order'
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
