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

		return glob(packagesPattern).then((files) => files.map(getPackageInfo)).then((pkgs) => {
			const r = {list: pkgs};
			pkgs.forEach((pkg) => {
				if (pkg.name) {
					r[pkg.name] = pkg;
				}
			});
			return r;
		});
	} catch (err) {
		cb(err);
		return Promise.reject(err);
	}
};

function getPackageInfo(dir) {
	const pkgPath = findConfig('package.json', {cwd: dir});

	if (!pkgPath) {
		return {
			rootDir: dir
		};
	} // not a package

	const originalPkg = findConfig.require('package.json', {cwd: dir});
	const pkg = Object.assign({}, originalPkg);
	pkg.rootDir = dir;
	pkg.original = originalPkg;
	return pkg;
}

