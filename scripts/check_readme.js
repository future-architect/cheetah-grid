'use strict';

const semver = require('semver');
const chalk = require('chalk');
const fs = require('fs');

function buildVersion(v) {
	return `${semver.major(v)}.${semver.minor(v)}`;
}
const version = buildVersion(require('../package.json').version);

const readmePath = require.resolve('../README.md');
const vueReadmePath = require.resolve('../packages/vue-cheetah-grid/README.md');
const gettingStarted = require.resolve('../packages/docs/introduction/getting-started.md');
const gettingStartedVue = require.resolve('../packages/docs/introduction/getting-started-with-vue.md');


[readmePath, vueReadmePath, gettingStarted, gettingStartedVue].forEach((readmePath) => {
	const readme = fs.readFileSync(readmePath, 'utf8');//eslint-disable-line

	const lineEndingPattern = /\r\n|[\r\n\u2028\u2029]/ug;
	const lineStartIndices = [];
	const lines = [];
	let match;
	while ((match = lineEndingPattern.exec(readme))) {
		lines.push(readme.slice(lineStartIndices[lineStartIndices.length - 1], match.index));
		lineStartIndices.push(match.index + match[0].length);
	}
	lines.push(readme.slice(lineStartIndices[lineStartIndices.length - 1]));


	const reUnpkg = /https:\/\/unpkg.com\/cheetah-grid@([a-zA-Z0-9.]*)/g;

	const errors = [];

	let result;
	while ((result = reUnpkg.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (`${version}` !== rmVersion) {
			const msg = `Invalid cdn version. act:${rmVersion} @ "${readmePath}"`;
			errors.push({
				msg,
				actual: rmVersion,
				expect: version,
				start: result.index,
				end: result.index + result[0].length,
				fixed: `https://unpkg.com/cheetah-grid@${version}`
			});
		}
	}

	const reUnpkgVue = /https:\/\/unpkg.com\/vue-cheetah-grid@([a-zA-Z0-9.]*)/g;

	while ((result = reUnpkgVue.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (`${version}` !== rmVersion) {
			const msg = `Invalid cdn version. act:${rmVersion} @ "${readmePath}"`;
			errors.push({
				msg,
				actual: rmVersion,
				expect: version,
				start: result.index,
				end: result.index + result[0].length,
				fixed: `https://unpkg.com/vue-cheetah-grid@${version}`
			});
		}
	}

	const reDocumentLink = /https:\/\/future-architect.github.io\/cheetah-grid\/([a-zA-Z0-9.]*)\//g;

	while ((result = reDocumentLink.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (version !== rmVersion && rmVersion !== 'documents') {
			const msg = `Invalid docs link version. act:${rmVersion} @ "${readmePath}"`;

			errors.push({
				msg,
				actual: rmVersion,
				expect: version,
				start: result.index,
				end: result.index + result[0].length,
				fixed: `https://future-architect.github.io/cheetah-grid/${version}`
			});
		}
	}


	if (errors.length) {
		const newReadme = [];
		let start = 0;
		for (const error of errors) {
			console.error(`${chalk.red(error.msg)}(${getLocTextFromIndex(error.start)})`);
			newReadme.push(readme.slice(start, error.start));
			newReadme.push(error.fixed);
			start = error.end;
		}
		newReadme.push(readme.slice(start));

		fs.writeFileSync(readmePath, newReadme.join(''),'utf8');//eslint-disable-line

		// readme
		process.exit(1);//eslint-disable-line no-process-exit
	}


	function getLocTextFromIndex(index) {
		if (index === readme.length) {
			return `${lines.length + 1}:${lines[lines.length - 1].length + 1}`;
		}

		const lineNumber = lineStartIndices.findIndex((col, i) => index < col);

		return `${lineNumber + 1}:${index - lineStartIndices[lineNumber - 1] + 1}`;
	}
});