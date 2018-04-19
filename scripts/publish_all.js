'use strict';
const chalk = require('chalk');
const spawn = require('./lib/spawn');
const packages = require('./lib/packages');

const opts = {cwd: process.cwd()};

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
			then((pkgs) => Promise.all(
					pkgs.list.map((pkg) => npm(pkg, 'publish', {}, opts))
			)).
			then(() => {
				cb(null);
			}).
			catch(cb);
	} catch (err) {
		cb(err);
	}
}


function npm(pkg, command, flags, opts) {
	if (SUPPORTED_COMMANDS.indexOf(command) === -1) {
		return Promise.reject(new Error(`Unsupported npm command: ${command}`));
	}
	if (!pkg.name) { return Promise.resolve(); } // not a package

	if (pkg.private) {
		console.log(`${chalk.green('skip private package')} ${pkg.name}`);
		return Promise.resolve();
	}

	const params = Object.keys(flags).reduce((arr, key) => {
		arr.push(`--${key}`, flags[key]);
		return arr;
	}, []);

	return spawn(pkg.name, 'npm', [command].concat(params), {
		cwd: pkg.rootDir,
		quiet: opts.quiet
	});
}