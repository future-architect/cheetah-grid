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


function checkPackageJsons(opts, cb) {
	try {
		packages(opts, cb).
			then((pkgs) => Promise.all(
					pkgs.list.map((pkg) => checkPackageJson(pkg, pkgs))
			)).
			then(() => {
				cb(null);
			}).
			catch(cb);
	} catch (err) {
		cb(err);
	}
}


function checkPackageJson(pkg, pkgs) {
	const errors = [];
	// check root version
	if (minorVersion(pkg.version) !== minorVersion(version)) {
		const message = `Invalid version. ${pkg.name}@${pkg.version}  root:${version} @ "${pkg.rootDir}/package.json"`;
		console.error(message);

		errors.push(
				callNpm(pkg, 'version', [version], opts).
					then(() => Promise.reject(new Error(message)))
		);
	}

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
			if (!pkgs[name]) {
				continue;
			}
			const depVer = dependencies[name].match(/(\d+\.\d+\.\d+)/g);
			if (!depVer) {
				continue;
			}
			const v = depVer[0];
			if (minorVersion(v) !== minorVersion(pkgs[name].version)) {
				const p = checkPublished(pkg, name, pkgs[name].version).
					then((isPublished) => {
						if (isPublished) {
							let install;
							if (depsName === 'dependencies' || depsName === 'devDependencies') {
								install = callNpm(pkg, 'i', [depsName === 'dependencies' ? '-S' : '-D', `${name}@latest`], opts);
							} else {
								install = Promise.resolve();
							}
							return install.then(() => {
								const message = `${name} version numbers do not match. expect:${pkgs[name].version} "${pkg.rootDir}/package.json".${depsName}.${name}:"${dependencies[name]}" `;
								console.error(message);
								return Promise.reject(new Error(message));
							});
						}
						return undefined;
					});
				errors.push(p);
			}
		}
	}
	return Promise.all(errors);
}

function checkPublished(pkg, name, actVer) {
	return callNpm(pkg, 'info', [name, 'versions', '--json'], opts).then((vers) => {
		vers = JSON.parse(vers);
		return (vers.indexOf(actVer) >= 0);
	});
}