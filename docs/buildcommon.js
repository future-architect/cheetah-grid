'use strict';

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
function versionCompare(v1, v2) {
	const v1parts = v1.split('.');
	const v2parts = v2.split('.');

	function isValidPart(x) {
		return (/^\d+$/).test(x);
	}
	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	while (v1parts.length < v2parts.length) { v1parts.push('9999'); }
	while (v2parts.length < v1parts.length) { v2parts.push('9999'); }

	for (let i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}

		if (v1parts[i] === v2parts[i]) {
			continue;
		} else if ((v1parts[i] - 0) > (v2parts[i] - 0)) {
			return 1;
		} else {
			return -1;
		}
	}

	if (v1parts.length !== v2parts.length) {
		return -1;
	}

	return 0;
}
const com = {
	getDocumentVersion() {
		if (watchMode || devMode) {
			return '.devdoc';
		}
		if (packageVersion === '0.0.1') {
			return packageVersion;
		}
		const [major, minor/*, patch*/] = packageVersion.split('.');
		return `${major}.${minor}`;
	},
	isEnabledVersion(v) {
		return versionCompare(v, packageVersion) <= 0;
	},
	packageVersion,
	watchMode,
	devMode,
};
module.exports = com;
