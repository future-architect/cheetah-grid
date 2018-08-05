'use strict';
const semver = require('semver');
const chalk = require('chalk');

function minorVersion(v) {
	return `${semver.major(v)}.${semver.minor(v)}`;
}
const linkVersion = minorVersion(require('../package.json').version);

const versions = require('../docs/versions.json');
if (versions.indexOf(linkVersion) < 0) {
	const msg = `Not found version @ "docs/versions.json". version:${linkVersion}`;
	console.error(chalk.red(msg));
	process.exit(1);//eslint-disable-line
}