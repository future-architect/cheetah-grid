'use strict';
const multimatch = require('multimatch');
const unique = require('uniq');
const path = require('path');

module.exports = function(opts) {
	opts = normalize(opts);
	const keys = Object.keys(opts);
	const match = matcher(opts);
	return (files, metalsmith, done) => {

		const metadata = metalsmith.metadata();
		metadata.textContents = metadata.textContents || {};
		const textContents = metadata.textContents;
		/**
		 * Find the files in each collection.
		 */
		Object.keys(files).forEach((file) => {
			const data = files[file];

			data.path = file;

			match(file, data).forEach((key) => {
				if (key && keys.indexOf(key) < 0) {
					opts[key] = {};
					keys.push(key);
				}
				let text = data.contents.toString().trim();
				if (path.extname(file) === '.js') {
					while (text.indexOf('/*') === 0) {
						text = text.substr(text.indexOf('*/') + 2).trim();
					}
				}

				textContents[key] = textContents[key] || {};
				textContents[key][file.replace(/\\/g, '/')] = text;
				delete files[file];
			});
		});

		/**
		 * Ensure that a default empty collection exists.
		 */

		keys.forEach((key) => {
			textContents[key] = textContents[key] || {};
		});


		done();
	};
};


function normalize(options) {
	options = options || {};

	for (const key in options) {
		const val = options[key];
		if (typeof val === 'string') { options[key] = {pattern: val}; }
		if (val instanceof Array) { options[key] = {pattern: val}; }
	}

	return options;
}

function matcher(cols) {
	const keys = Object.keys(cols);
	const matchers = {};

	keys.forEach((key) => {
		const opts = cols[key];
		if (!opts.pattern) {
			return;
		}
		matchers[key] = {
			match(file) {
				return multimatch(file, opts.pattern);
			}
		};
	});

	return function(file, data) {
		const matches = [];
		for (const key in matchers) {
			const m = matchers[key];
			if (m.match(file).length) {
				matches.push(key);
			}
		}

		return unique(matches);
	};
}