'use strict';

const Promise = require('bluebird');
const chalk = require('chalk');
const nodeSpawn = require('child_process').spawn;
const prefixedStream = require('./prefixedStream');

module.exports = function spawn(scope, script, args, opts) {
	return new Promise((resolve, reject) => {
		const p = nodeSpawn(/^win/.test(process.platform) ? `${script}.cmd` : script, args, {cwd: opts.cwd});

		if (!opts.quiet) {
			const stderr = prefixedStream.create({prefix: `${chalk.red(scope)} `});
			const stdout = prefixedStream.create({prefix: `${chalk.green(scope)} `});

			p.stderr.pipe(stderr).pipe(process.stderr);
			p.stdout.pipe(stdout).pipe(process.stdout);
		}

		p.on('exit', (code) => {
			if (code === 0) {
				if (!opts.quiet) {
					console.log(`${chalk.green(scope)} OK`);
				}
				resolve();
			} else {
				const err = new Error('Script failure');
				if (!opts.quiet) {
					console.error(`${chalk.red(scope)} exit code #${code}`);
				}
				err.code = code;
				err.scope = scope;
				reject(err);
			}
		});
	});
};
