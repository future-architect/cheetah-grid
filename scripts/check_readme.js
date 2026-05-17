'use strict';

const semver = require('semver');
const chalk = require('chalk');
const fs = require('fs');

const shouldWrite = process.argv.includes('--write');

function buildVersion(v) {
	const parsed = semver.parse(v);
	if (!parsed) {
		throw new Error(`Invalid version: ${v}`);
	}
	return `${parsed.major}.${parsed.minor}`;
}

const versions = {
	cheetahGrid: buildVersion(require('../packages/cheetah-grid/package.json').version),
	vueCheetahGrid: buildVersion(require('../packages/vue-cheetah-grid/package.json').version)
};

const readmePath = require.resolve('../README.md');
const vueReadmePath = require.resolve('../packages/vue-cheetah-grid/README.md');
const gettingStarted = require.resolve('../packages/docs/introduction/getting-started.md');
const gettingStartedVue = require.resolve('../packages/docs/introduction/getting-started-with-vue.md');

let hasErrors = false;

[readmePath, vueReadmePath, gettingStarted, gettingStartedVue].forEach((readmePath) => {
	const readme = fs.readFileSync(readmePath, 'utf8');//eslint-disable-line

	const errors = [];

	collectVersionErrors({
		readme,
		readmePath,
		errors,
		pattern: /(https:\/\/unpkg.com\/cheetah-grid@)([a-zA-Z0-9.-]*)/g,
		expected: versions.cheetahGrid,
		label: 'cdn version'
	});

	collectVersionErrors({
		readme,
		readmePath,
		errors,
		pattern: /(https:\/\/unpkg.com\/vue-cheetah-grid@)([a-zA-Z0-9.-]*)/g,
		expected: versions.vueCheetahGrid,
		label: 'cdn version'
	});

	collectVersionErrors({
		readme,
		readmePath,
		errors,
		pattern: /(https:\/\/future-architect.github.io\/cheetah-grid\/)([a-zA-Z0-9.-]*)(\/)/g,
		expected: versions.cheetahGrid,
		label: 'docs link version',
		ignore: (actual) => actual === 'documents'
	});

	if (errors.length) {
		hasErrors = true;
		for (const error of errors) {
			console.error(`${chalk.red(error.msg)}(${getLocTextFromIndex(error.start)})`);
		}
		if (shouldWrite) {
			const newReadme = [];
			let start = 0;
			for (const error of errors) {
				newReadme.push(readme.slice(start, error.start));
				newReadme.push(error.fixed);
				start = error.end;
			}
			newReadme.push(readme.slice(start));
			fs.writeFileSync(readmePath, newReadme.join(''), 'utf8');//eslint-disable-line
		}
	}


	function getLocTextFromIndex(index) {
		const before = readme.slice(0, index);
		const lines = before.split(/\r\n|[\r\n\u2028\u2029]/u);
		return `${lines.length}:${lines[lines.length - 1].length + 1}`;
	}
});

if (hasErrors) {
	if (shouldWrite) {
		console.error(chalk.green('Updated README/docs package versions.'));
	} else {
		console.error('Run `pnpm run update:docs` to update README/docs package versions.');
		process.exit(1);//eslint-disable-line no-process-exit
	}
}

function collectVersionErrors({
	readme,
	readmePath,
	errors,
	pattern,
	expected,
	label,
	ignore = () => false
}) {
	let result;
	while ((result = pattern.exec(readme)) !== null) {
		const actual = result[2];
		if (ignore(actual) || expected === actual) {
			continue;
		}
		const fixed = result.slice(1).map((text, index) => {
			if (index === 1) {
				return expected;
			}
			return text;
		}).join('');
		errors.push({
			msg: `Invalid ${label}. act:${actual} @ "${readmePath}"`,
			actual,
			expect: expected,
			start: result.index,
			end: result.index + result[0].length,
			fixed
		});
	}
}
