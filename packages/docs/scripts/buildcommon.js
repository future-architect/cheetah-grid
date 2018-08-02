'use strict';
const semver = require('semver');
let watchMode = false;
let devMode = false;
for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i] === '--watch') {
		watchMode = true;
	}
	if (process.argv[i] === '--dev' || process.argv[i] === '-D') {
		devMode = true;
	}
}

const packageVersion = require('../package.json').version;
// const latestVersion = require('./versions.json')[0];
const com = {
	getDocumentVersion() {
		if (watchMode || devMode) {
			return '.devdoc';
		}
		if (packageVersion === '0.0.1') {
			return packageVersion;
		}
		return `${semver.major(packageVersion)}.${semver.minor(packageVersion)}`;
	},
	isEnabledVersion(v) {
		return semver.lte(v, packageVersion);
	},
	packageVersion,
	get packageVersionX() {
		return `${semver.major(packageVersion)}.${semver.minor(packageVersion)}.x`;
	},
	watchMode,
	devMode,
};
module.exports = com;
