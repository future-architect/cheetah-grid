'use strict';


const spawn = require('./spawn');

module.exports = function npm(pkg, command, params, opts, outOpt) {
	if (!pkg.name) { return Promise.resolve(); } // not a package


	return spawn(pkg.name, 'npm', [command].concat(params), {
		cwd: pkg.rootDir,
		quiet: opts.quiet
	}, outOpt);
};

