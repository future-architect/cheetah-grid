'use strict';

const babel = require('babel-core');

const JS_FILENAME_REGEXP = /\.js$/;

module.exports = function() {

	/**
	 * @param {Object} files
	 * @param {Metalsmith} metalsmith
	 * @param {Function} done
	 */
	return function(files, metalsmith, done) {
		let file, data;
		for (file in files) {
			if (JS_FILENAME_REGEXP.test(file)) {
				data = files[file];

				const option = {presets: ['env']};
				data.contents = Buffer.from(babel.transform(data.contents.toString(), option).code);
			}
		}

		setImmediate(done);
	};
};
