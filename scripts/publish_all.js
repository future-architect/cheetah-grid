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
			then((pkgs) => {

				const tree = [...pkgs.tree];
				let queue = Promise.resolve();
				tree.forEach((group) => {
					console.log(`publish:${group.map((p) => p.name).join(' ')}`);
					queue = queue.then(() => Promise.all(group.map((pkg) => npmPublish(pkg, opts))));
				});
				return queue;
			}).
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
