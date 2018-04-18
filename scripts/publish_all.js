'use strict';
const chalk = require('chalk');
const opts = {cwd: process.cwd()};
const findConfig = require('find-config');
const spawn = require('./lib/spawn');
const packages = require('./lib/packages');

const SUPPORTED_COMMANDS = ['install', 'publish'];


function handleDone(err) {
	if (err) {
		console.error(`${chalk.red('error')} ${err.message}`);
		process.exit(err.code || 1);//eslint-disable-line
	}
}

publish(opts, handleDone);


function publish(opts, cb) {
	try {
		packages(opts, cb).
			then((files) => Promise.all(
					files.map((dirPath) => npm(dirPath, 'publish', {}, opts))
			)).
			then(() => {
				cb(null);
			}).
			catch(cb);
	} catch (err) {
		cb(err);
	}
}


function npm(dirPath, command, flags, opts) {
	if (SUPPORTED_COMMANDS.indexOf(command) === -1) {
		return Promise.reject(new Error(`Unsupported npm command: ${command}`));
	}

	const pkgPath = findConfig('package.json', {cwd: dirPath});

	if (!pkgPath) { return Promise.resolve(); } // not a package

	const pkg = findConfig.require('package.json', {cwd: dirPath});

	if (pkg.private) {
		console.log(`${chalk.green('skip private package')} ${pkg.name}`);
		return Promise.resolve();
	}

	const params = Object.keys(flags).reduce((arr, key) => {
		arr.push(`--${key}`, flags[key]);
		return arr;
	}, []);

	return spawn(pkg.name, 'npm', [command].concat(params), {
		cwd: dirPath,
		quiet: opts.quiet
	});
}