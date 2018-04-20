'use strict';


const dependenciesKeys = ['dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies',
	'bundledDependencies'];

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
			r.tree = makeTree(r);
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

function getInternalDependencies(pkg, pkgs) {
	if (pkg._internalDependencies) {
		return pkg._internalDependencies;
	}

	const set = new Set();
	dependenciesKeys.forEach((depsName) => {
		const dependencies = pkg[depsName];
		for (const name in dependencies) {
			const dep = pkgs[name];
			if (!dep) {
				continue;
			}
			set.add(name);
			getInternalDependencies(dep, pkgs).forEach((n) => set.add(n));
		}
	});
	return (pkg._internalDependencies = Array.from(set));
}

function compareDep(a, b, pkgs) {
	const adeps = getInternalDependencies(a, pkgs);
	const bdeps = getInternalDependencies(b, pkgs);

	if (bdeps.indexOf(a.name) > -1) {
		return -1;
	}
	if (adeps.indexOf(b.name) > -1) {
		return 1;
	}
	return adeps.length - bdeps.length;

}

function makeTree(pkgs) {
	const list = [...pkgs.list];
	list.sort((a, b) => compareDep(a, b, pkgs));
	const tree = [];
	let pre = list[0];
	let group = [pre];
	tree.push(group);
	for (let i = 1; i < list.length; i++) {
		const e = list[i];
		if (compareDep(pre, e, pkgs) === 0) {
			group.push(e);
		} else {
			pre = e;
			group = [pre];
			tree.push(group);
		}
	}
	return tree;
}
