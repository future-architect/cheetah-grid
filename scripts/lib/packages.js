'use strict';


const findConfig = require('find-config');
const path = require('path');
const glob = require('bluebird').promisify(require('glob'));

module.exports = function packages(opts, cb) {
	const pkgPath = findConfig('package.json', {cwd: opts.cwd});
	const rootPath = path.dirname(pkgPath);

	if (!pkgPath) {
		cb(new Error('Could not find package.json'));
		return Promise.reject(new Error('Could not find package.json'));
	}

	try {
		require(pkgPath);

		const packagesPattern = path.resolve(rootPath, 'packages/*');

		return glob(packagesPattern);
	} catch (err) {
		cb(err);
		return Promise.reject(err);
	}
};

