'use strict';


const toposort = require('toposort');
const findConfig = require('find-config');
const path = require('path');
const glob = require('bluebird').promisify(require('glob'));


const dependenciesKeys = ['dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies',
	'bundledDependencies'];

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

function getInternalDependencies(name, pkgs) {
	const pkg = pkgs[name];
	if (pkg._internalDependencies) {
		return pkg._internalDependencies;
	}

	const set = new Set();
	dependenciesKeys.forEach((depsName) => {
		const dependencies = pkg[depsName];
		for (const nm in dependencies) {
			const dep = pkgs[nm];
			if (!dep) {
				continue;
			}
			set.add(nm);
			getInternalDependencies(nm, pkgs).forEach((n) => set.add(n));
		}
	});
	return (pkg._internalDependencies = Array.from(set));
}

function compareDep(a, b, pkgs) {
	const adeps = getInternalDependencies(a.name, pkgs);
	const bdeps = getInternalDependencies(b.name, pkgs);

	if (bdeps.indexOf(a.name) > -1) {
		return -1;
	}
	if (adeps.indexOf(b.name) > -1) {
		return 1;
	}
	return 0;

}

function makeTree(pkgs) {
	const graph = [...pkgs.list].map((pkg) => pkg.name).
		map((name) => [name, ...getInternalDependencies(name, pkgs)]);

	const list = toposort(graph).filter((n) => n).reverse().map((name) => pkgs[name]);
	console.log(list.map((p) => p.name));

	const tree = [];
	let group = [list[0]];
	tree.push(group);
	for (let i = 1; i < list.length; i++) {
		const e = list[i];
		if (group.every((pre) => compareDep(pre, e, pkgs) === 0)) {
			group.push(e);
		} else {
			group = [e];
			tree.push(group);
		}
	}
	return tree;
}
