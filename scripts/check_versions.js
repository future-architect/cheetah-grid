'use strict';

const fs = require('fs');
const path = require('path');
const {execFile} = require('child_process');
const {promisify} = require('util');
const {version} = require('../package.json');

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');

function minorVersion(v) {
	const match = String(v).match(/(\d+)\.(\d+)/);
	return match ? `${match[1]}.${match[2]}` : String(v);
}

function handleDone(err) {
	if (err) {
		console.error(`error ${err.message}`);
		process.exit(err.code || 1);//eslint-disable-line
	}
}

checkPackageJsons(handleDone);

async function checkPackageJsons(cb) {
	try {
		const pkgs = loadPackages();
		const pkgsByName = Object.fromEntries(pkgs.map((pkg) => [pkg.name, pkg]));
		await Promise.all(
				pkgs.map((pkg) => checkPackageJson(pkg, pkgsByName))
		);
		cb(null);
	} catch (err) {
		cb(err);
	}
}

function loadPackages() {
	return fs.readdirSync(packagesDir, {withFileTypes: true})
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => path.join(packagesDir, dirent.name))
		.map((pkgRootDir) => {
			const packageJsonPath = path.join(pkgRootDir, 'package.json');
			if (!fs.existsSync(packageJsonPath)) {
				return null;
			}
			return {
				...JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')),
				rootDir: pkgRootDir,
				packageJsonPath
			};
		})
		.filter(Boolean);
}

async function checkPackageJson(pkg, pkgsByName) {
	if (pkg.name === 'react-cheetah-grid') {
		return;
	}
	// check root version
	if (minorVersion(pkg.version) !== minorVersion(version)) {
		throw new Error(`Invalid version. ${pkg.name}@${pkg.version}  root:${version} @ "${pkg.packageJsonPath}"`);
	}

	for (const {depsName, version: v, name} of genVersions(pkg, pkgsByName)) {
		if (minorVersion(v) !== minorVersion(pkgsByName[name].version)) {
			// eslint-disable-next-line no-await-in-loop
			const isPublished = await checkPublished(name, pkgsByName[name].version);

			if (isPublished) {
				throw new Error(`${name} version numbers do not match. expect:${pkgsByName[name].version} "${pkg.packageJsonPath}".${depsName}.${name}:"${v}" `);
			}
		}
	}
}

async function checkPublished(name, actVer) {
	const {stdout} = await execFileAsync('pnpm', ['view', name, 'versions', '--json'], {
		cwd: rootDir,
		maxBuffer: 10 * 1024 * 1024
	});
	const versions = JSON.parse(stdout);
	return versions.includes(actVer);
}

function *genVersions(pkg, pkgsByName) {

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
		if (!dependencies || Array.isArray(dependencies)) {
			continue;
		}
		for (const name in dependencies) {
			if (!pkgsByName[name]) {
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
