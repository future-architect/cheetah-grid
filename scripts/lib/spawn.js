'use strict';

const Promise = require('bluebird');
const chalk = require('chalk');
const nodeSpawn = require('child_process').spawn;
const prefixedStream = require('./prefixedStream');

module.exports = function spawn(scope, script, args, opts, outOpt) {
	outOpt = outOpt || {};
	return new Promise((resolve, reject) => {
		const p = nodeSpawn(/^win/.test(process.platform) ? `${script}.cmd` : script, args, {cwd: opts.cwd});

		let result = '';
		if (!opts.quiet) {
			const stderr = prefixedStream.create({prefix: `${chalk.red(scope)} `});
			const stdout = prefixedStream.create({prefix: `${chalk.green(scope)} `});

			p.stderr.pipe(stderr).pipe(process.stderr);
			if (outOpt.log !== false) {
				p.stdout.pipe(stdout).pipe(process.stdout);
			}
			p.stdout.on('data', (data) => {
				result += data;
			});
		}

		p.on('exit', (code) => {
			if (code === 0) {
				if (!opts.quiet) {
					if (outOpt.log !== false) {
						console.log(`${chalk.green(scope)} OK`);
					}
				}
				resolve(result);
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
