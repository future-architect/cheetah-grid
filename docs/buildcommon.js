'use strict';

const latestVersion = require('./versions.json')[0];
function versionCompare(v1, v2) {
	const v1parts = v1.split('.');
	const v2parts = v2.split('.');

	function isValidPart(x) {
		return (/^\d+$/).test(x);
	}
	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	while (v1parts.length < v2parts.length) v1parts.push('9999');
	while (v2parts.length < v1parts.length) v2parts.push('9999');

	for (let i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}

		if (v1parts[i] === v2parts[i]) {
			continue;
		} else if (v1parts[i] > v2parts[i]) {
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
	latestVersion,
	getDocumentVersion(v) {
		if (com.isDevVersion(v)) {
			return '.devdoc';
		}
		const [major, minor/*, patch*/] = v.split('.');
		return `${major}.${minor}`;
	},
	isDevVersion(v) {
		return versionCompare(v, latestVersion) > 0;
	},
	isEnabledVersion(v) {
		return versionCompare(v, '9999') <= 0;
	},
	versionCompare,
};
module.exports = com;
