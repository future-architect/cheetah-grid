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

update(opts, handleDone);


function update(opts, cb) {
	try {
		packages(opts, cb).
			then((pkgs) => Promise.all(
					pkgs.list.map((pkg) => npmUpdate(pkg, opts))
			)).
			then(() => {
				cb(null);
			}).
			catch(cb);
	} catch (err) {
		cb(err);
	}
}

function npmUpdate(pkg, opts) {
	return npm(pkg, 'update', [], opts);
}
