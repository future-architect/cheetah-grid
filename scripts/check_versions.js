'use strict';
const chalk = require('chalk');
const packages = require('mrpm/lib/packages');
const {version} = require('../package.json');
const opts = {cwd: process.cwd()};

function minorVersion(v) {
	const a = v.split('.');
	return `${a[0]}.${a[1]}`;
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
		const message = `Invalid version. ${pkg.name}:${pkg.version}  root:${version}`;
		console.error(message);
		errors.push(Promise.reject(new Error(message)));
	}

	// check dependencies
	const dependenciesKeys = ['dependencies',
		// 'devDependencies',
		'peerDependencies',
		'optionalDependencies',
		'bundledDependencies'];
	for (const depsName of dependenciesKeys) {
		const dependencies = pkg[depsName];
		for (const name in dependencies) {
			if (!pkgs[name]) {
				continue;
			}
			const v = dependencies[name].match(/(\d+\.\d+\.\d+)/g)[0];
			if (v !== pkgs[name].version) {

				const message = `${name} version numbers do not match. ${pkg.name}.${depsName}.${name}:${dependencies[name]}  expect:${pkgs[name].version}`;
				console.error(message);
				errors.push(Promise.reject(new Error(message)));
			}
		}
	}
	return Promise.all(errors);
}