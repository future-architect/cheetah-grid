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

build(opts, handleDone);


function build(opts, cb) {
	try {
		packages(opts, cb).
			then((pkgs) => {
				const tree = [...pkgs.tree];
				let queue = Promise.resolve();
				tree.forEach((group) => {
					console.log(`build:${group.map((p) => p.name).join(' ')}`);
					queue = queue.then(() => Promise.all(group.map((pkg) => npmRunBuild(pkg, opts))));
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

function npmRunBuild(pkg, opts) {
	return npm(pkg, 'run', ['build'], opts);
}
