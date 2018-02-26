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
				console.log(file)
				data = files[file];

				const option = {presets: ['es2015']};
				data.contents = Buffer.from(babel.transform(data.contents.toString(), option).code);
			}
		}

		setImmediate(done);
	};
};
