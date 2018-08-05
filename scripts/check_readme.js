'use strict';

const semver = require('semver');
const chalk = require('chalk');
const fs = require('fs');

function buildCdnVersion(v) {
	return `${semver.major(v)}.${semver.minor(v)}.x`;
}
const cdnVersion = buildCdnVersion(require('../package.json').version);


const readmePath = require.resolve('../README.md');
const readme = fs.readFileSync(readmePath, 'utf8');//eslint-disable-line
const re = /https:\/\/unpkg.com\/cheetah-grid@([a-zA-Z0-9.]*)/g;

let result;
while ((result = re.exec(readme)) !== null) {
	const rmVersion = result[1];
	if (cdnVersion !== rmVersion) {
		const msg = `Invalid cdn version. act:${rmVersion} @ README.md`;
		console.error(chalk.red(msg));
		process.exit(1);//eslint-disable-line
	}
}