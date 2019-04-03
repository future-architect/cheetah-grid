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
const gettingStarted = require.resolve('../packages/docs2/introduction/01.GettingStarted.md');
const gettingStartedVue = require.resolve('../packages/docs2/introduction/02.GettingStartedWithVue.md');


[readmePath, vueReadmePath, gettingStarted, gettingStartedVue].forEach((readmePath) => {
	const readme = fs.readFileSync(readmePath, 'utf8');//eslint-disable-line
	const reUnpkg = /https:\/\/unpkg.com\/cheetah-grid@([a-zA-Z0-9.]*)/g;

	let result;
	while ((result = reUnpkg.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (`${version}.x` !== rmVersion) {
			const msg = `Invalid cdn version. act:${rmVersion} @ "${readmePath}"`;
			console.error(chalk.red(msg));
			process.exit(1);//eslint-disable-line no-process-exit
		}
	}

	const reUnpkgVue = /https:\/\/unpkg.com\/vue-cheetah-grid@([a-zA-Z0-9.]*)/g;

	while ((result = reUnpkgVue.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (`${version}.x` !== rmVersion) {
			const msg = `Invalid cdn version. act:${rmVersion} @ "${readmePath}"`;
			console.error(chalk.red(msg));
			process.exit(1);//eslint-disable-line no-process-exit
		}
	}

	const reDocumentLink = /https:\/\/future-architect.github.io\/cheetah-grid\/([a-zA-Z0-9.]*)\//g;

	while ((result = reDocumentLink.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (version !== rmVersion) {
			const msg = `Invalid docs link version. act:${rmVersion} @ "${readmePath}"`;
			console.error(chalk.red(msg));
			process.exit(1);//eslint-disable-line no-process-exit
		}
	}


	const reGHDocumentLink = /https:\/\/github.com\/future-architect\/cheetah-grid\/tree\/master\/docs\/([a-zA-Z0-9.]*)\//g;

	while ((result = reGHDocumentLink.exec(readme)) !== null) {
		const rmVersion = result[1];
		if (version !== rmVersion) {
			const msg = `Invalid docs link version. act:${rmVersion} @ "${readmePath}`;
			console.error(chalk.red(msg));
			process.exit(1);//eslint-disable-line no-process-exit
		}
	}
});