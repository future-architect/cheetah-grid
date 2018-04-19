'use strict';
const chalk = require('chalk');
const packages = require('./lib/packages');
const npm = require('./lib/callNpm');

const opts = {cwd: process.cwd()};


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
					pkgs.list.map((pkg) => npmPublish(pkg, opts))
			)).
			then(() => {
				cb(null);
			}).
			catch(cb);
	} catch (err) {
		cb(err);
	}
}

function npmPublish(pkg, opts) {
	if (pkg.private) {
		console.log(`${chalk.green('skip private package')} ${pkg.name}`);
		return Promise.resolve();
	}
	return npm(pkg, 'info', [pkg.name, 'versions', '--json'], opts, {log: false}).then((vers) => {
		vers = JSON.parse(vers);
		// console.log(vers);
		if (vers.indexOf(pkg.version) >= 0) {
			console.log(`${chalk.green('skip exists package version')} ${pkg.name}@${pkg.version}`);
			return Promise.resolve();

		}
		return npm(pkg, 'publish', [], opts);
	});
}
