'use strict';

const semver = require('semver');
const chalk = require('chalk');
const packages = require('mrpm/lib/packages');
const {version} = require('../package.json');
const opts = {cwd: process.cwd()};
const callNpm = require('mrpm/lib/callNpm');

function minorVersion(v) {
	return `${semver.major(v)}.${semver.minor(v)}`;
}

function handleDone(err) {
	if (err) {
		console.error(`${chalk.red('error')} ${err.message}`);
		process.exit(err.code || 1);//eslint-disable-line
	}
}

checkPackageJsons(opts, handleDone);

async function checkPackageJsons(opts, cb) {
	try {
		const pkgs = await packages(opts);
		await	Promise.all(
				pkgs.list.map((pkg) => checkPackageJson(pkg, pkgs))
		);
		cb(null);
	} catch (err) {
		cb(err);
	}
}


async function checkPackageJson(pkg, pkgs) {
	if (pkg.name === 'react-cheetah-grid') {
		return;
	}
	// check root version
	if (minorVersion(pkg.version) !== minorVersion(version)) {
		const message = `Invalid version. ${pkg.name}@${pkg.version}  root:${version} @ "${pkg.rootDir}/package.json"`;
		console.error(message);

		await callNpm(pkg, 'version', [version], opts);

		throw new Error(message);
	}

	for (const {depsName, version: v, name} of genVersions(pkg, pkgs)) {
		if (minorVersion(v) !== minorVersion(pkgs.pkgs[name].version)) {
			// eslint-disable-next-line no-await-in-loop
			const isPublished = await	checkPublished(pkg, name, pkgs.pkgs[name].version);

			if (isPublished) {
				if (depsName === 'dependencies' || depsName === 'devDependencies') {
					// eslint-disable-next-line no-await-in-loop
					await callNpm(pkg, 'i', [depsName === 'dependencies' ? '-S' : '-D', `${name}@latest`], opts);
				}
				const message = `${name} version numbers do not match. expect:${pkgs.pkgs[name].version} "${pkg.rootDir}/package.json".${depsName}.${name}:"${v}" `;
				console.error(message);
				throw new Error(message);
			}
		}
	}
}

function checkPublished(pkg, name, actVer) {
	return callNpm(pkg, 'info', [name, 'versions', '--json'], opts).then((vers) => {
		vers = JSON.parse(vers);
		return (vers.indexOf(actVer) >= 0);
	});
}

function *genVersions(pkg, pkgs) {

	// check dependencies
	const dependenciesKeys = [
		'dependencies',
		'devDependencies',
		'peerDependencies',
		'optionalDependencies',
		'bundledDependencies'
	];
	for (const depsName of dependenciesKeys) {
		const dependencies = pkg[depsName];
		for (const name in dependencies) {
			if (!pkgs.pkgs[name]) {
				continue;
			}
			const depVer = dependencies[name].match(/(\d+\.\d+\.\d+)/g);
			if (!depVer) {
				continue;
			}
			yield {
				depsName,
				name,
				version: depVer[0]
			};
		}
	}

}