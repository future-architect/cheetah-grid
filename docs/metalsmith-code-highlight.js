'use strict';

//https://github.com/fortes/metalsmith-code-highlight
//ライブラリが古いのでコピーして作成

const jsdom = require('jsdom');
const highlightjs = require('highlight.js');

const HTML_FILENAME_REGEXP = /\.html$/,
	DOCTYPE_TAG_REGEXP = /^[\s]*<!DOCTYPE ([^>]*)>/i;

/**
 * @param {!string} html
 * @return {?string} Null if not found
 */
const getDocType = function(html) {
	const match = (html || '').match(DOCTYPE_TAG_REGEXP);
	if (match) {
		return match[0];
	}
	return null;
};

/**
 * @param {!string} html
 * @return {!string} New HTML with code highlighted
 */
const highlightFile = function(html) {
	let container;
	const docType = getDocType(html);

	// Parse HTML into DOM.  If doctype present, load as entire html document
	// instead of setting an elem innerHTML.
	if (docType) {
		container = new jsdom.JSDOM(html).window.document;
	} else {
		container = new jsdom.JSDOM().window.document.createElement('div');

		container.innerHTML = html;
	}

	const blocks = container.querySelectorAll('pre code');
	Array.prototype.forEach.call(blocks, highlightjs.highlightBlock);

	if (docType) {
		return `${docType}\n${container.getElementsByTagName('html')[0].outerHTML}`;
	} else {
		return container.innerHTML;
	}
};

module.exports = function(options = {}) {
	highlightjs.configure(options);

	/**
	 * @param {Object} files
	 * @param {Metalsmith} metalsmith
	 * @param {Function} done
	 */
	return function(files, metalsmith, done) {
		let file, data;
		for (file in files) {
			if (HTML_FILENAME_REGEXP.test(file)) {
				data = files[file];
				data.contents = Buffer.from(highlightFile(data.contents.toString()));
			}
		}

		setImmediate(done);
	};
};
