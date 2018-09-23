'use strict';

const babel = require('@babel/core');

const JS_FILENAME_REGEXP = /\.js$/;

module.exports = function() {

	/**
	 * @param {Object} files files
	 * @param {Metalsmith} metalsmith metalsmith
	 * @param {Function} done done
	 * @returns {void}
	 */
	return function(files, metalsmith, done) {
		let file, data;
		for (file in files) {
			if (JS_FILENAME_REGEXP.test(file)) {
				data = files[file];

				const option = {presets: ['@babel/preset-env']};
				data.contents = Buffer.from(babel.transform(data.contents.toString(), option).code);
			}
		}

		setImmediate(done);
	};
};
